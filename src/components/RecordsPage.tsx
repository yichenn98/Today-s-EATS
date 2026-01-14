import React, { useMemo } from 'react';
import { MealRecord, Category } from '../types';
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS } from '../constants';
import Calendar from './Calendar';

interface RecordsPageProps {
  records: MealRecord[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onEditRecord: (record: MealRecord) => void;
  onAddAtCategory: (cat: Category) => void;
}

const RecordsPage: React.FC<RecordsPageProps> = ({
  records,
  selectedDate,
  setSelectedDate,
  onEditRecord,
  onAddAtCategory,
}) => {
  const dailyRecords = useMemo(() => {
    return records.filter((r) => r.date === selectedDate);
  }, [records, selectedDate]);

  const getMealForCategory = (cat: Category) => dailyRecords.find((r) => r.category === cat);

  const handleBlockClick = (cat: Category) => {
    const meal = getMealForCategory(cat);
    if (meal) onEditRecord(meal);
    else onAddAtCategory(cat);
  };

  // ✅ 今天（給 Calendar 用）
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="animate-in fade-in duration-500">
      {/* 先維持你原本 Calendar 介面 */}
      <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <div className="p-4 grid grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => {
          const meal = getMealForCategory(cat);
          const color = CATEGORY_COLORS[cat];

          return (
            <button
              key={cat}
              onClick={() => handleBlockClick(cat)}
              className="aspect-square rounded-[32px] overflow-hidden relative border border-[#E5DCD3]/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white active:scale-95 transition-transform text-left group"
            >
              {meal ? (
                <div className="absolute inset-0 w-full h-full">
                  {meal.image ? (
                    <>
                      <img
                        src={meal.image}
                        alt={meal.mealName}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    </>
                  ) : (
                    <div
                      className="absolute inset-0 w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <div className="text-white opacity-20 scale-[5]">{CATEGORY_ICONS[cat]}</div>
                    </div>
                  )}

                  <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
                    <p className="text-white font-bold text-sm truncate drop-shadow-md">{meal.mealName}</p>
                    <p className="text-white/80 text-[10px] truncate drop-shadow-sm">{meal.shopName}</p>
                    <p className="text-white font-black text-sm mt-1 drop-shadow-md">${meal.price}</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4">
                  <div
                    className="p-4 rounded-2xl mb-2 opacity-10 group-hover:opacity-20 transition-opacity"
                    style={{ backgroundColor: color }}
                  >
                    <div className="text-[#5D6D7E]">{CATEGORY_ICONS[cat]}</div>
                  </div>
                  <span className="text-[#5D6D7E]/30 text-[10px] font-black tracking-widest uppercase group-hover:text-[#5D6D7E]/50">
                    {cat}
                  </span>
                </div>
              )}

              <div
                className={`absolute top-4 left-4 px-2.5 py-1 rounded-xl shadow-sm border flex items-center gap-1.5 z-20 ${
                  meal ? 'bg-white/20 backdrop-blur-md border-white/10' : 'bg-white/90 border-[#E5DCD3]/30'
                }`}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                <span className={`text-[9px] font-black ${meal ? 'text-white' : 'text-[#5D6D7E]'}`}>{cat}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-6 py-4 mt-2">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-lg font-black text-[#5D6D7E]">今日美食清單</h3>
            <p className="text-[10px] text-gray-300 uppercase tracking-widest">Daily Notes</p>
          </div>
          <span className="px-3 py-1 bg-[#E5DCD3]/30 rounded-full text-[10px] font-bold text-[#5D6D7E]">
            {dailyRecords.length} 筆紀錄
          </span>
        </div>

        {dailyRecords.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[40px] border border-dashed border-[#E5DCD3]">
            <p className="text-gray-400 text-sm italic">今天還沒有美食紀錄喔...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dailyRecords.map((r) => (
              <button
                key={r.id}
                onClick={() => onEditRecord(r)}
                className="w-full flex items-center gap-4 bg-white p-4 rounded-[28px] border border-[#E5DCD3]/30 hover:border-[#5D6D7E]/20 transition-all shadow-sm active:scale-[0.98] text-left"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: `${CATEGORY_COLORS[r.category]}20`, color: CATEGORY_COLORS[r.category] }}
                >
                  {CATEGORY_ICONS[r.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#5D6D7E] truncate">{r.mealName}</h4>
                  <p className="text-[10px] text-gray-400 truncate tracking-wide">{r.shopName}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-[#5D6D7E]">${r.price}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordsPage;
