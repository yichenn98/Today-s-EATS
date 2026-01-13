
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MealRecord, Category } from '../types';
import { CATEGORIES, CATEGORY_COLORS, MORANDI_PRIMARY } from '../constants';
import { TrendingUp, Award, DollarSign } from 'lucide-react';

interface StatsPageProps {
  records: MealRecord[];
}

const StatsPage: React.FC<StatsPageProps> = ({ records = [] }) => {
  const stats = useMemo(() => {
    const summary: Record<Category, { total: number; shops: Record<string, number>; items: Record<string, number> }> = {
      '早餐': { total: 0, shops: {}, items: {} },
      '午餐': { total: 0, shops: {}, items: {} },
      '晚餐': { total: 0, shops: {}, items: {} },
      '飲料/零食/宵夜': { total: 0, shops: {}, items: {} }
    };

    records.forEach(r => {
      if (summary[r.category]) {
        summary[r.category].total += (Number(r.price) || 0);
        summary[r.category].shops[r.shopName] = (summary[r.category].shops[r.shopName] || 0) + 1;
        summary[r.category].items[r.mealName] = (summary[r.category].items[r.mealName] || 0) + 1;
      }
    });

    const getMostFrequent = (obj: Record<string, number>) => {
      const keys = Object.keys(obj);
      if (keys.length === 0) return '尚未紀錄';
      return keys.reduce((a, b) => obj[a] > obj[b] ? a : b);
    };

    return CATEGORIES.map(cat => ({
      name: cat,
      value: summary[cat].total,
      mostShop: getMostFrequent(summary[cat].shops),
      mostItem: getMostFrequent(summary[cat].items),
      color: CATEGORY_COLORS[cat]
    }));
  }, [records]);

  // Filter out zero-value categories for the pie chart to ensure cleaner gaps
  const pieData = useMemo(() => stats.filter(s => s.value > 0), [stats]);

  const totalSpending = useMemo(() => stats.reduce((acc, curr) => acc + curr.value, 0), [stats]);
  
  const topCategory = useMemo(() => {
    if (totalSpending === 0) return { name: '無紀錄' };
    return stats.reduce((a, b) => a.value > b.value ? a : b);
  }, [stats, totalSpending]);

  return (
    <div className="p-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-2xl font-black text-[#5D6D7E]">消費統計</h2>
        <p className="text-xs text-gray-400 tracking-widest uppercase">Gastronomy Analysis</p>
      </div>

      <div style={{ backgroundColor: MORANDI_PRIMARY }} className="rounded-[40px] p-8 text-white mb-8 shadow-xl relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Expenditure</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">${totalSpending.toLocaleString()}</span>
            <span className="text-[10px] text-white/30 font-bold">TWD</span>
          </div>
          <div className="mt-8 flex gap-3">
             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1 border border-white/5">
                <TrendingUp size={14} className="text-[#ABB6A4] mb-1" />
                <span className="text-[9px] text-white/40 uppercase font-black tracking-wider">Top Sector</span>
                <p className="text-xs font-bold truncate">
                   {topCategory.name}
                </p>
             </div>
             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1 border border-white/5">
                <Award size={14} className="text-[#D5A6A3] mb-1" />
                <span className="text-[9px] text-white/40 uppercase font-black tracking-wider">Entries</span>
                <p className="text-xs font-bold">{records.length} Times</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20"></div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-[32px] p-8 border border-[#E5DCD3]/50 shadow-sm">
          <h3 className="text-[10px] font-black text-[#5D6D7E] uppercase tracking-widest mb-6 flex items-center gap-2">
            <DollarSign size={14} /> Expenditure Proportion
          </h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="white"
                  strokeWidth={4}
                  startAngle={90}
                  endAngle={450}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 mt-10 px-4">
            {stats.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: item.color }}></div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1.5">{item.name}</span>
                  <span className="text-[14px] font-black text-[#5D6D7E] truncate">${item.value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-black text-[#5D6D7E] uppercase tracking-widest px-1">Preference</h3>
          <div className="space-y-3">
            {stats.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#E5DCD3]/40 p-5 rounded-[32px] flex items-center gap-5 hover:shadow-md transition-shadow">
                <div 
                  className="w-14 h-14 rounded-[20px] flex items-center justify-center text-xl shadow-inner flex-shrink-0"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  {item.name === '早餐' ? '🥪' : item.name === '午餐' ? '🍱' : item.name === '晚餐' ? '🥘' : '🥤'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{item.name}</span>
                    <span className="text-xs font-black text-[#5D6D7E]">${item.value}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#5D6D7E] truncate">Top: {item.mostShop}</h4>
                  <p className="text-[10px] text-gray-400 truncate">Popular: {item.mostItem}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
