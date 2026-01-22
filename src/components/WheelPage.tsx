import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { MealRecord } from '../types';
import { AlertCircle, Sparkles, Plus, Trash2, X, Settings2, Check, MinusCircle } from 'lucide-react';
import { CATEGORY_COLORS, MORANDI_PRIMARY } from '../constants';
import { subscribeWheelPrefs, saveWheelPrefs } from "../cloud";

interface WheelPageProps {
  records: MealRecord[];
  uid: string | null;
}

type WheelPrefs = {
  customShops?: string[];
  excludedShops?: string[];
};

const normalizeShop = (s: string) => (s ?? '').trim();

const WheelPage: React.FC<WheelPageProps> = ({ records, uid }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // ✅ 自訂店家（手動新增）
  const [customShops, setCustomShops] = useState<string[]>([]);

  // ✅ 排除清單（不想轉到的店；包含「紀錄帶進來」的店）
  const [excludedShops, setExcludedShops] = useState<string[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // ✅ 管理面板（顯示所有店家，可排除/加入）
  const [isManageOpen, setIsManageOpen] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const currentRotation = useRef(0);

  // ---------------------------
  // ✅ Firestore：同步 prefs（換裝置也保留）
  // ---------------------------
  useEffect(() => {
    if (!uid) {
      // 沒登入：保留本地狀態（或你想清掉也可以）
      return;
    }
    const unsub = subscribeWheelPrefs(uid, (prefs: WheelPrefs | null) => {
      const cs = (prefs?.customShops ?? []).map(normalizeShop).filter(Boolean);
      const ex = (prefs?.excludedShops ?? []).map(normalizeShop).filter(Boolean);

      // 去重
      setCustomShops(Array.from(new Set(cs)));
      setExcludedShops(Array.from(new Set(ex)));
    });
    return () => unsub?.();
  }, [uid]);

  const persistPrefs = async (nextCustom: string[], nextExcluded: string[]) => {
    if (!uid) return;
    const payload: WheelPrefs = {
      customShops: Array.from(new Set(nextCustom.map(normalizeShop).filter(Boolean))),
      excludedShops: Array.from(new Set(nextExcluded.map(normalizeShop).filter(Boolean))),
    };
    try {
      await saveWheelPrefs(uid, payload);
    } catch (e) {
      console.error("saveWheelPrefs failed:", e);
      // 這裡不 alert，避免干擾使用體驗
    }
  };

  // ---------------------------
  // ✅ all shops（從紀錄 + 自訂合併）
  // ---------------------------
  const allShopsRaw = useMemo(() => {
    const fromRecords = records
      .map(r => normalizeShop(r.shopName))
      .filter(Boolean);

    const fromCustom = customShops
      .map(normalizeShop)
      .filter(Boolean);

    // 合併去重
    return Array.from(new Set([...fromRecords, ...fromCustom]));
  }, [records, customShops]);

  const excludedSet = useMemo(() => new Set(excludedShops.map(normalizeShop)), [excludedShops]);

  // ✅ 真正轉盤用：排除後的 shops
  const wheelShops = useMemo(() => {
    const filtered = allShopsRaw.filter(s => !excludedSet.has(normalizeShop(s)));
    if (filtered.length === 0) return [];
    if (filtered.length === 1) return [...filtered, '隨機探險']; // 保留你原本的「至少 2 片」
    return filtered;
  }, [allShopsRaw, excludedSet]);

  // 如果 result 被排除了，就清掉避免顯示怪怪
  useEffect(() => {
    if (result && excludedSet.has(normalizeShop(result))) setResult(null);
  }, [excludedSet, result]);

  // ---------------------------
  // ✅ D3 Draw
  // ---------------------------
  useEffect(() => {
    if (!svgRef.current || wheelShops.length === 0) return;

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    const mainGroup = svgElement
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("class", "wheel-group")
      .attr("transform", `translate(${width / 2}, ${height / 2}) rotate(${currentRotation.current % 360})`);

    const data = wheelShops.map((name) => ({ name, value: 1 }));
    const morandiColors = Object.values(CATEGORY_COLORS);
    const pie = d3.pie<{ name: string; value: number }>().value(d => d.value).sort(null);
    const arc = d3.arc<any>().innerRadius(30).outerRadius(radius);

    const arcs = mainGroup.selectAll("g.slice")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "slice");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (_d, i) => morandiColors[i % morandiColors.length])
      .attr("stroke", "white")
      .attr("stroke-width", "3");

    arcs.append("text")
      .attr("transform", (d) => {
        const _d = arc.centroid(d);
        const rotation = (d.startAngle + d.endAngle) / 2 * (180 / Math.PI);
        return `translate(${_d[0] * 0.75}, ${_d[1] * 0.75}) rotate(${rotation - 90})`;
      })
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "11px")
      .style("font-weight", "900")
      .text(d => d.data.name.length > 5 ? d.data.name.slice(0, 4) + '..' : d.data.name);
  }, [wheelShops]);

  // ---------------------------
  // ✅ Actions
  // ---------------------------
  const addCustomShop = async () => {
    const trimmed = normalizeShop(inputValue);
    if (!trimmed) return;

    // 已存在就不重複加
    if (customShops.some(s => normalizeShop(s) === trimmed)) {
      setInputValue('');
      setIsAddModalOpen(false);
      return;
    }

    const next = [...customShops, trimmed];
    setCustomShops(next);
    setInputValue('');
    setIsAddModalOpen(false);

    await persistPrefs(next, excludedShops);
  };

  const clearCustomShops = async () => {
    setCustomShops([]);
    setResult(null);
    await persistPrefs([], excludedShops);
  };

  // ✅ 排除某店（不刪紀錄，只是不進轉盤）
  const excludeShop = async (shop: string) => {
    const s = normalizeShop(shop);
    if (!s) return;
    if (excludedSet.has(s)) return;

    const nextExcluded = [...excludedShops, s];
    setExcludedShops(nextExcluded);
    setResult(null);

    await persistPrefs(customShops, nextExcluded);
  };

  // ✅ 加回轉盤
  const includeShop = async (shop: string) => {
    const s = normalizeShop(shop);
    const nextExcluded = excludedShops.filter(x => normalizeShop(x) !== s);
    setExcludedShops(nextExcluded);

    await persistPrefs(customShops, nextExcluded);
  };

  // ✅ 移除自訂店家（完全刪掉自訂項）
  const removeCustomShop = async (shop: string) => {
    const s = normalizeShop(shop);
    const nextCustom = customShops.filter(x => normalizeShop(x) !== s);
    setCustomShops(nextCustom);
    setResult(null);

    // 如果它同時在 excluded，也順便清掉（避免遺留）
    const nextExcluded = excludedShops.filter(x => normalizeShop(x) !== s);
    setExcludedShops(nextExcluded);

    await persistPrefs(nextCustom, nextExcluded);
  };

  const spin = () => {
    if (spinning || wheelShops.length === 0) return;
    setSpinning(true);
    setResult(null);

    const rounds = 12;
    const extraAngle = Math.random() * 360;
    const targetRotation = currentRotation.current + (rounds * 360) + extraAngle;

    const wheelGroup = d3.select(svgRef.current).select(".wheel-group");

    wheelGroup.transition()
      .duration(1800)
      .ease(d3.easeCubicInOut)
      .attrTween("transform", () => {
        const i = d3.interpolate(currentRotation.current, targetRotation);
        return (t) => `translate(150, 150) rotate(${i(t)})`;
      })
      .on("end", () => {
        setSpinning(false);
        currentRotation.current = targetRotation;

        const finalNormalizedRotation = (360 - (targetRotation % 360)) % 360;
        const segmentSize = 360 / wheelShops.length;
        const index = Math.floor(finalNormalizedRotation / segmentSize);
        setResult(wheelShops[index]);
      });
  };

  // 管理面板用：顯示（所有店家，含自訂/紀錄）
  const manageList = useMemo(() => {
    // 讓自訂排前面（好找），其餘字母/中文排序
    const customSet = new Set(customShops.map(normalizeShop));
    const sorted = [...allShopsRaw].sort((a, b) => normalizeShop(a).localeCompare(normalizeShop(b), 'zh-Hant'));
    sorted.sort((a, b) => (customSet.has(normalizeShop(a)) === customSet.has(normalizeShop(b)) ? 0 : customSet.has(normalizeShop(a)) ? -1 : 1));
    return sorted;
  }, [allShopsRaw, customShops]);

  return (
    <div className="p-8 flex flex-col items-center animate-in fade-in duration-500 min-h-full">
      <div className="w-full flex items-center justify-between mb-6">
        <div className="text-left">
          <h2 className="text-2xl font-black text-[#5D6D7E] mb-1">抉擇轉盤</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em]">Decision Wheel</p>
        </div>

        <button
          type="button"
          onClick={() => setIsManageOpen(v => !v)}
          className="px-4 py-2 rounded-2xl bg-white border border-[#E5DCD3]/50 text-[#5D6D7E] text-xs font-black flex items-center gap-2 shadow-sm hover:bg-gray-50 transition"
        >
          <Settings2 size={16} />
          管理
        </button>
      </div>

      {/* ✅ 管理面板 */}
      {isManageOpen && (
        <div className="w-full mb-6 bg-white border border-[#E5DCD3]/50 rounded-[28px] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-black text-[#5D6D7E]">轉盤店家管理</p>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-0.5">
                排除後「不影響紀錄」，只是不會出現在轉盤
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsManageOpen(false)}
              className="p-2 rounded-full border border-[#E5DCD3]/50 hover:bg-[#E5DCD3]/20 transition"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          {manageList.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              目前沒有任何店家
            </div>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto hide-scrollbar pr-1">
              {manageList.map((shop) => {
                const s = normalizeShop(shop);
                const isExcluded = excludedSet.has(s);
                const isCustom = customShops.some(x => normalizeShop(x) === s);

                return (
                  <div
                    key={s}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-[#E5DCD3]/40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#5D6D7E] truncate">
                        {shop}
                        {isCustom && (
                          <span className="ml-2 text-[10px] font-black text-[#B8A7B5] bg-[#E5DCD3]/30 px-2 py-0.5 rounded-full">
                            自訂
                          </span>
                        )}
                        {isExcluded && (
                          <span className="ml-2 text-[10px] font-black text-[#D5A6A3] bg-[#D5A6A3]/10 px-2 py-0.5 rounded-full">
                            已排除
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => removeCustomShop(shop)}
                          className="p-2 rounded-full border border-red-100 hover:bg-red-50 transition group"
                          title="刪除自訂店家"
                        >
                          <Trash2 size={16} className="text-red-300 group-hover:text-red-500" />
                        </button>
                      )}

                      {!isExcluded ? (
                        <button
                          type="button"
                          onClick={() => excludeShop(shop)}
                          className="px-3 py-2 rounded-full bg-[#D5A6A3]/10 border border-[#D5A6A3]/30 text-[#D5A6A3] text-xs font-black flex items-center gap-1 hover:bg-[#D5A6A3]/20 transition"
                          title="從轉盤排除"
                        >
                          <MinusCircle size={14} />
                          排除
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => includeShop(shop)}
                          className="px-3 py-2 rounded-full bg-[#ABB6A4]/10 border border-[#ABB6A4]/30 text-[#5D6D7E] text-xs font-black flex items-center gap-1 hover:bg-[#ABB6A4]/20 transition"
                          title="加入回轉盤"
                        >
                          <Check size={14} />
                          加回
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="relative mb-12">
        {wheelShops.length > 0 && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
            <div
              style={{ backgroundColor: MORANDI_PRIMARY }}
              className="w-6 h-8 clip-triangle rounded-b-sm shadow-xl border-x-[2px] border-white/20"
            />
          </div>
        )}

        <div className="bg-white p-6 rounded-full shadow-[0_30px_60px_-15px_rgba(93,109,126,0.15)] border border-[#E5DCD3]/50">
          {wheelShops.length === 0 ? (
            <div className="w-[300px] h-[300px] rounded-full border-4 border-dashed border-[#E5DCD3] flex flex-col items-center justify-center">
              <AlertCircle size={40} className="text-[#E5DCD3] mb-4" />
              <p className="text-[#5D6D7E] font-bold text-xs">沒有店家可以轉</p>
              <p className="text-[10px] text-gray-400 mt-1">請手動新增，或到「管理」把店家加回</p>
            </div>
          ) : (
            <svg ref={svgRef} className="overflow-visible" />
          )}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-white rounded-full shadow-lg border-4 border-[#FDFBF9] flex items-center justify-center z-10">
              <Sparkles size={20} className="text-[#E5DCD3]" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full space-y-4 mb-8">
        <button
          onClick={spin}
          disabled={spinning || wheelShops.length === 0}
          style={{ backgroundColor: MORANDI_PRIMARY }}
          className={`w-full py-5 text-white rounded-[32px] font-black text-lg shadow-xl transition-all ${
            spinning || wheelShops.length === 0 ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'
          }`}
        >
          {spinning ? '命運轉動中...' : '交給命運的安排🪄'}
        </button>

        {result && (
          <div className="bg-[#E5DCD3]/30 border border-[#E5DCD3]/50 p-6 rounded-[32px] text-center animate-in zoom-in duration-500">
            <span className="text-[9px] font-black text-[#B8A7B5] uppercase tracking-[0.2em] mb-1 block">Decision Result</span>
            <h3 className="text-2xl font-black text-[#5D6D7E] mb-1">{result}</h3>
            <p className="text-xs text-gray-400 italic">這就是最好的安排！</p>
          </div>
        )}
      </div>

      <div className="w-full flex gap-3">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex-1 py-4 bg-white border border-[#E5DCD3]/50 rounded-[24px] text-[#5D6D7E] font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-all"
        >
          <Plus size={18} />
          快速新增店家
        </button>

        {customShops.length > 0 && (
          <button
            onClick={clearCustomShops}
            className="px-6 py-4 bg-[#D5A6A3]/10 border border-[#D5A6A3]/30 rounded-[24px] text-[#D5A6A3] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#D5A6A3]/20 transition-all"
            title="清空自訂店家（不會影響紀錄）"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#5D6D7E]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#FDFBF9] w-full max-w-xs rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#5D6D7E]">店名</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-[#D5A6A3]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomShop()}
                placeholder="店名是..."
                className="w-full px-5 py-4 bg-white border border-[#E5DCD3]/50 rounded-2xl text-sm outline-none focus:border-[#5D6D7E]/30"
              />
              <button
                onClick={addCustomShop}
                style={{ backgroundColor: MORANDI_PRIMARY }}
                className="w-full py-4 text-white rounded-2xl font-black text-sm shadow-lg hover:opacity-90 transition-all"
              >
                加入轉盤清單
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WheelPage;
