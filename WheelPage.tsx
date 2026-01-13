
import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { MealRecord } from '../types';
import { AlertCircle, Sparkles, Plus, Trash2, X } from 'lucide-react';
import { CATEGORY_COLORS, MORANDI_PRIMARY } from '../constants';

interface WheelPageProps {
  records: MealRecord[];
}

const WheelPage: React.FC<WheelPageProps> = ({ records }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [customShops, setCustomShops] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  const currentRotation = useRef(0);

  const allShops = useMemo(() => {
    const historicalShops = Array.from(new Set(records.map(r => r.shopName)));
    const combined = Array.from(new Set([...historicalShops, ...customShops]));
    if (combined.length === 0) return [];
    if (combined.length === 1) return [...combined, '隨機探險'];
    return combined;
  }, [records, customShops]);

  // Initial Draw & Update
  useEffect(() => {
    if (!svgRef.current || allShops.length === 0) return;
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
    
    const data = allShops.map((name, i) => ({ name, value: 1 }));
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
      .attr("fill", (d, i) => morandiColors[i % morandiColors.length])
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
  }, [allShops]);

  const addCustomShop = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !customShops.includes(trimmed)) {
      setCustomShops([...customShops, trimmed]);
      setInputValue('');
      setIsAddModalOpen(false);
    }
  };

  const spin = () => {
    if (spinning || allShops.length === 0) return;
    setSpinning(true);
    setResult(null);

    // 物理參數優化：
    // 總圈數 12 圈在 1.8 秒內是「極速感」與「流暢感」的最佳平衡點
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
        const segmentSize = 360 / allShops.length;
        const index = Math.floor(finalNormalizedRotation / segmentSize);
        setResult(allShops[index]);
      });
  };

  return (
    <div className="p-8 flex flex-col items-center animate-in fade-in duration-500 min-h-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-[#5D6D7E] mb-1">抉擇轉盤</h2>
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em]">Decision Wheel</p>
      </div>

      <div className="relative mb-12">
        {allShops.length > 0 && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
            <div 
              style={{ backgroundColor: MORANDI_PRIMARY }} 
              className="w-6 h-8 clip-triangle rounded-b-sm shadow-xl border-x-[2px] border-white/20"
            ></div>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-full shadow-[0_30px_60px_-15px_rgba(93,109,126,0.15)] border border-[#E5DCD3]/50">
          {allShops.length === 0 ? (
             <div className="w-[300px] h-[300px] rounded-full border-4 border-dashed border-[#E5DCD3] flex flex-col items-center justify-center">
                <AlertCircle size={40} className="text-[#E5DCD3] mb-4" />
                <p className="text-[#5D6D7E] font-bold text-xs">沒有店家可以轉</p>
                <p className="text-[10px] text-gray-400 mt-1">請手動新增店家名單</p>
             </div>
          ) : (
            <svg ref={svgRef} className="overflow-visible"></svg>
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
          disabled={spinning || allShops.length === 0}
          style={{ backgroundColor: MORANDI_PRIMARY }}
          className={`w-full py-5 text-white rounded-[32px] font-black text-lg shadow-xl transition-all ${
            spinning || allShops.length === 0 ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'
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
            onClick={() => { setCustomShops([]); setResult(null); }}
            className="px-6 py-4 bg-[#D5A6A3]/10 border border-[#D5A6A3]/30 rounded-[24px] text-[#D5A6A3] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#D5A6A3]/20 transition-all"
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
