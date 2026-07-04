import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseDateFromId, MONTH_NAMES_PT } from '../utils/dateHelpers';
import { DaySchedule } from '../types';

interface DatePaginationControlsProps {
  days: DaySchedule[];
  selectedYearMonth: string; // e.g. "2026-07"
  selectedPage: number; // 1 or 2
  onSelectYearMonth: (ym: string) => void;
  onSelectPage: (page: number) => void;
}

export const DatePaginationControls: React.FC<DatePaginationControlsProps> = ({
  days,
  selectedYearMonth,
  selectedPage,
  onSelectYearMonth,
  onSelectPage,
}) => {
  // Extract unique year-months from days
  const yearMonthsMap = new Map<string, { year: number; month: number; label: string }>();

  days.forEach((d) => {
    const { year, month } = parseDateFromId(d.id);
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    if (!yearMonthsMap.has(key)) {
      const monthName = MONTH_NAMES_PT[month - 1] || `Mês ${month}`;
      yearMonthsMap.set(key, {
        year,
        month,
        label: `${monthName} / ${year}`,
      });
    }
  });

  const availableYearMonths = Array.from(yearMonthsMap.entries())
    .map(([key, val]) => ({ key, ...val }))
    .sort((a, b) => a.key.localeCompare(b.key));

  const currentMonthObj = yearMonthsMap.get(selectedYearMonth) || availableYearMonths[0];
  const currentMonthIndexInList = availableYearMonths.findIndex((m) => m.key === selectedYearMonth);

  // Navigate Previous Page / Month
  const handlePrev = () => {
    if (selectedPage === 2) {
      onSelectPage(1);
    } else if (currentMonthIndexInList > 0) {
      const prevMonth = availableYearMonths[currentMonthIndexInList - 1];
      onSelectYearMonth(prevMonth.key);
      onSelectPage(2);
    }
  };

  // Navigate Next Page / Month
  const handleNext = () => {
    if (selectedPage === 1) {
      onSelectPage(2);
    } else if (currentMonthIndexInList < availableYearMonths.length - 1) {
      const nextMonth = availableYearMonths[currentMonthIndexInList + 1];
      onSelectYearMonth(nextMonth.key);
      onSelectPage(1);
    }
  };

  const isPrevDisabled = selectedPage === 1 && currentMonthIndexInList <= 0;
  const isNextDisabled = selectedPage === 2 && currentMonthIndexInList >= availableYearMonths.length - 1;

  return (
    <div className="bg-[#13161f] border border-[#d4af37]/30 rounded-2xl p-3.5 shadow-xl space-y-3">
      {/* Month Tabs Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Agenda do Mês
          </span>
        </div>

        {/* Previous / Next Arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={isPrevDisabled}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
              isPrevDisabled
                ? 'bg-slate-900/50 border-slate-800/50 text-slate-600 cursor-not-allowed opacity-40'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300 active:scale-95'
            }`}
            title="Página / Mês Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px]">Anterior</span>
          </button>
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
              isNextDisabled
                ? 'bg-slate-900/50 border-slate-800/50 text-slate-600 cursor-not-allowed opacity-40'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300 active:scale-95'
            }`}
            title="Próxima Página / Mês"
          >
            <span className="hidden sm:inline text-[11px]">Próxima</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month Pills Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {availableYearMonths.map((m) => {
          const isSelected = m.key === selectedYearMonth;
          return (
            <button
              key={m.key}
              onClick={() => {
                onSelectYearMonth(m.key);
                onSelectPage(1); // Default to Page 1 when changing month
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                isSelected
                  ? 'gold-bg-gradient text-slate-950 border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Page Buttons (Quinzena Pagination: Página 1 vs Página 2) */}
      <div className="pt-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Página do Mês</span>
          <span className="text-amber-400 font-semibold">
            {currentMonthObj?.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Page 1 Button: Dias 1 a 15 */}
          <button
            onClick={() => onSelectPage(1)}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
              selectedPage === 1
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${selectedPage === 1 ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs uppercase">Página 1</span>
            </div>
            <span className="text-[10px] font-semibold opacity-90 text-slate-300">
              Dia 01 ao Dia 15
            </span>
          </button>

          {/* Page 2 Button: Dias 16 ao Fim do Mês */}
          <button
            onClick={() => onSelectPage(2)}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
              selectedPage === 2
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${selectedPage === 2 ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs uppercase">Página 2</span>
            </div>
            <span className="text-[10px] font-semibold opacity-90 text-slate-300">
              Dia 16 ao Fim do Mês
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
