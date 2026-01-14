import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MORANDI_PRIMARY } from '../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange }) => {
  // Use a reference date to determine which month's window to show
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  // ✅ refs for centering today
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const todayBtnRef = useRef<HTMLButtonElement | null>(null);
  const didAutoCenterRef = useRef(false);

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
      // 切月份時，允許重新置中（避免月份切換後 today 不在列表）
      didAutoCenterRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  // Generate a range of days around the viewDate
  const days = useMemo(() => {
    const result: Date[] = [];
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
    setViewDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
    didAutoCenterRef.current = false;
  };

  const handleNextMonth = () => {
    setViewDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
    didAutoCenterRef.current = false;
  };

  const displayMonth = `${viewDate.getFullYear()}年 ${viewDate.getMonth() + 1}月`;

  // ✅ 進入頁面/切月份後：把「今天」捲到中間（只做一次，不會一直干擾）
  useEffect(() => {
    if (didAutoCenterRef.current) return;

    // 等 DOM 畫完再捲（避免抓不到 ref）
    const t = window.setTimeout(() => {
      if (todayBtnRef.current) {
        todayBtnRef.current.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
        didAutoCenterRef.current = true;
      }
    }, 0);

    return () => window.clearTimeout(t);
  }, [days, todayStr]);

  // ✅ 回到今天（同時把 viewDate 調到今天那個月，確保今天一定在列表內）
  const goToday = () => {
    const now = new Date();
    const nowStr = formatDate(now);

    // 如果目前顯示月份不是今天所在月份，先切換月份
    if (now.getMonth() !== viewDate.getMonth() || now.getFullYear() !== viewDate.getFullYear()) {
      setViewDate(new Date(now));
      didAutoCenterRef.current = false;
    }

    onDateChange(nowStr);

    // 再捲到中間（稍等 view 更新）
    window.setTimeout(() => {
      if (todayBtnRef.current) {
        todayBtnRef.current.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      } else if (scrollerRef.current) {
        // fallback：捲到中間附近
        const el = scrollerRef.current;
        el.scrollTo({ left: el.scrollWidth / 2, behavior: 'smooth' });
      }
    }, 50);
  };

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

        <div className="flex flex-col items-end gap-2">
          {/* ✅ 回到今天按鈕：手機也看得到 */}
          <button
            type="button"
            onClick={goToday}
            className="px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-[#E5DCD3]/60 bg-white hover:bg-[#E5DCD3]/30 text-[#5D6D7E] transition-all active:scale-[0.98]"
            title="回到今天"
          >
            回到今天
          </button>

          <div className="hidden xs:block text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-none">
            Timeline
          </div>
          <div className="hidden xs:flex items-center gap-1 -mt-1">
            <div className="w-2 h-2 rounded-[4px] border border-[#D5A6A3]"></div>
            <span className="text-[8px] font-bold text-gray-400 uppercase">Today</span>
          </div>
        </div>
      </div>

      <div ref={scrollerRef} className="flex overflow-x-auto gap-3 py-3 px-4 hide-scrollbar snap-x">
        {days.map((date, idx) => {
          const dateStr = formatDate(date);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const isCurrentMonth = date.getMonth() === viewDate.getMonth();

          return (
            <button
              key={idx}
              ref={isToday ? todayBtnRef : null} // ✅ 今天那顆才掛 ref
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
              <span
                className={`text-[9px] font-black uppercase mb-1 ${
                  isSelected ? 'text-white/70' : isToday ? 'text-[#D5A6A3]' : 'text-gray-300'
                }`}
              >
                {dayNames[date.getDay()]}
              </span>
              <span className={`text-sm font-black ${isToday && !isSelected ? 'text-[#D5A6A3]' : ''}`}>
                {date.getMonth() + 1}/{date.getDate()}
              </span>
              {isToday && (
                <div
                  className={`absolute -top-1 -right-1 px-1 rounded-md text-[8px] font-black ${
                    isSelected ? 'bg-white text-[#5D6D7E]' : 'bg-[#D5A6A3] text-white shadow-sm'
                  }`}
                >
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
