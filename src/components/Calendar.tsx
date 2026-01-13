
import React, { useMemo, useState, useEffect } from 'react';
import { MORANDI_PRIMARY } from '../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange }) => {
  // Use a reference date to determine which month's window to show
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  // Fix: formatDate using local time components to avoid timezone shifts
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => formatDate(new Date()), []);

  // Sync viewDate when selectedDate changes from outside
  useEffect(() => {
    const d = new Date(selectedDate);
    if (d.getMonth() !== viewDate.getMonth() || d.getFullYear() !== viewDate.getFullYear()) {
      setViewDate(d);
    }
  }, [selectedDate]);

  // Generate a range of days around the viewDate
  const days = useMemo(() => {
    const result = [];
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const end = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
    
    const startDate = new Date(start);
    startDate.setDate(startDate.getDate() - 5);
    
    const endDate = new Date(end);
    endDate.setDate(endDate.getDate() + 5);

    const curr = new Date(startDate);
    while (curr <= endDate) {
      result.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return result;
  }, [viewDate]);

  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  const handlePrevMonth = () => {
    setViewDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setViewDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const displayMonth = `${viewDate.getFullYear()}年 ${viewDate.getMonth() + 1}月`;

  return (
    <div className="bg-transparent pt-4 pb-2">
      {/* Month/Year Header with Navigation */}
      <div className="px-6 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrevMonth}
            className="p-1 hover:bg-[#E5DCD3]/50 rounded-full transition-colors text-[#5D6D7E]"
          >
            <ChevronLeft size={18} strokeWidth={3} />
          </button>
          <span className="text-xl font-black text-[#5D6D7E] tracking-tight min-w-[120px] text-center">
            {displayMonth}
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-1 hover:bg-[#E5DCD3]/50 rounded-full transition-colors text-[#5D6D7E]"
          >
            <ChevronRight size={18} strokeWidth={3} />
          </button>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest hidden xs:block leading-none">Timeline</span>
          <div className="flex items-center gap-1 mt-1 hidden xs:flex">
             <div className="w-2 h-2 rounded-[4px] border border-[#D5A6A3]"></div>
             <span className="text-[8px] font-bold text-gray-400 uppercase">Today</span>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-3 py-3 px-4 hide-scrollbar snap-x">
        {days.map((date, idx) => {
          const dateStr = formatDate(date);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const isCurrentMonth = date.getMonth() === viewDate.getMonth();
          
          return (
            <button
              key={idx}
              onClick={() => onDateChange(dateStr)}
              style={isSelected ? { backgroundColor: MORANDI_PRIMARY } : {}}
              className={`flex-shrink-0 w-14 flex flex-col items-center py-3 rounded-2xl transition-all snap-center relative ${
                isSelected 
                  ? 'text-white shadow-lg scale-105 z-10' 
                  : isCurrentMonth 
                    ? 'bg-white text-gray-400 hover:bg-[#E5DCD3] border border-[#E5DCD3]/30'
                    : 'bg-white/50 text-gray-300 border border-dashed border-[#E5DCD3]/20 opacity-60'
              } ${isToday && !isSelected ? 'ring-2 ring-[#D5A6A3] ring-inset' : ''}`}
            >
              <span className={`text-[9px] font-black uppercase mb-1 ${isSelected ? 'text-white/70' : isToday ? 'text-[#D5A6A3]' : 'text-gray-300'}`}>
                {dayNames[date.getDay()]}
              </span>
              <span className={`text-sm font-black ${isToday && !isSelected ? 'text-[#D5A6A3]' : ''}`}>
                {date.getMonth() + 1}/{date.getDate()}
              </span>
              {isToday && (
                <div className={`absolute -top-1 -right-1 px-1 rounded-md text-[8px] font-black ${isSelected ? 'bg-white text-[#5D6D7E]' : 'bg-[#D5A6A3] text-white shadow-sm'}`}>
                  今
                </div>
              )}
            </button>
          );
        })}
        {/* Spacer for better scrolling end experience */}
        <div className="flex-shrink-0 w-4"></div>
      </div>
    </div>
  );
};

export default Calendar;
