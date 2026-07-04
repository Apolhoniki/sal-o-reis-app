import React from 'react';
import { Calendar, ChevronRight, Lock, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { DaySchedule } from '../types';

interface DayCardProps {
  day: DaySchedule;
  isSelected: boolean;
  onSelectDay: (day: DaySchedule) => void;
}

export const DayCard: React.FC<DayCardProps> = ({ day, isSelected, onSelectDay }) => {
  const isRed = day.status === 'vermelho' || day.isBlocked;
  const isGreen = day.status === 'verde' && !isRed;
  const isYellow = day.status === 'amarelo' && !isRed;

  const handleClick = () => {
    if (!isRed) {
      onSelectDay(day);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative w-full rounded-2xl p-5 transition-all duration-300 select-none ${
        isRed
          ? 'bg-slate-900/40 border border-slate-800/60 opacity-60 cursor-not-allowed filter grayscale-[20%]'
          : 'cursor-pointer hover:scale-[1.01] active:scale-[0.98]'
      } ${
        isSelected
          ? 'gold-border-glow-active bg-gradient-to-br from-[#1d222e] to-[#121620] ring-2 ring-[#d4af37]/60'
          : !isRed
          ? 'dark-card-bg border border-slate-800 hover:border-[#d4af37]/40 shadow-lg'
          : ''
      }`}
    >
      {/* Selection Glow Indicator */}
      {isSelected && (
        <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 font-bold p-1 rounded-full shadow-lg text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {/* Left: Day Title and Date */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold border ${
              isRed
                ? 'bg-slate-900 border-slate-800 text-slate-500'
                : isSelected
                ? 'gold-bg-gradient text-slate-950 border-[#d4af37]'
                : 'bg-slate-800/80 border-slate-700 text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 mb-0.5 opacity-80" />
            <span className="text-[11px] leading-none uppercase tracking-wider font-semibold">
              {day.dayNumber.replace('Dia ', '')}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              {day.dayOfWeek}
              <span className="text-xs font-normal text-slate-400">({day.dayNumber})</span>
            </h3>

            {/* Status Traffic Light Indicator */}
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  isGreen
                    ? 'bg-emerald-500 green-status-glow animate-pulse'
                    : isYellow
                    ? 'bg-amber-400 yellow-status-glow'
                    : 'bg-rose-500 red-status-glow'
                }`}
              />
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  isGreen
                    ? 'text-emerald-400'
                    : isYellow
                    ? 'text-amber-300'
                    : 'text-rose-400'
                }`}
              >
                {day.statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Right Arrow / Lock Icon */}
        <div className="shrink-0">
          {isRed ? (
            <div className="flex items-center gap-1 text-slate-500 text-xs bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-800">
              <Lock className="w-3.5 h-3.5 text-rose-400/80" />
              <span className="hidden sm:inline">Esgotado</span>
            </div>
          ) : (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                isSelected
                  ? 'gold-bg-gradient text-slate-950 font-bold'
                  : 'bg-slate-800/90 text-slate-300 group-hover:translate-x-1'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      {/* Available Periods Quick Badges */}
      {!isRed && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400/80" />
            <span>Períodos:</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <span
              className={`px-2 py-0.5 rounded text-[11px] ${
                day.periods.manha
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                  : day.extraSlots?.manha
                  ? 'bg-amber-950/90 text-amber-300 border border-amber-500/80 font-bold yellow-status-glow animate-pulse'
                  : 'bg-slate-900 text-slate-600 line-through'
              }`}
            >
              Manhã {day.extraSlots?.manha ? '⚡' : ''}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] ${
                day.periods.tarde
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                  : day.extraSlots?.tarde
                  ? 'bg-amber-950/90 text-amber-300 border border-amber-500/80 font-bold yellow-status-glow animate-pulse'
                  : 'bg-slate-900 text-slate-600 line-through'
              }`}
            >
              Tarde {day.extraSlots?.tarde ? '⚡' : ''}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] ${
                day.periods.noite
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                  : day.extraSlots?.noite
                  ? 'bg-amber-950/90 text-amber-300 border border-amber-500/80 font-bold yellow-status-glow animate-pulse'
                  : 'bg-slate-900 text-slate-600 line-through'
              }`}
            >
              Noite {day.extraSlots?.noite ? '⚡' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
