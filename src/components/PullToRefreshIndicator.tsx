import React from 'react';
import { RefreshCw, Check, Sparkles } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  isRefreshing: boolean;
  pullDistance: number;
  threshold?: number;
  onManualRefresh?: () => void;
  showSuccessToast?: boolean;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  isRefreshing,
  pullDistance,
  threshold = 60,
  onManualRefresh,
  showSuccessToast,
}) => {
  const isTriggered = pullDistance >= threshold;

  if (!isRefreshing && pullDistance <= 0 && !showSuccessToast) {
    return null;
  }

  return (
    <div className="w-full flex justify-center py-2 transition-all duration-200 animate-slideDownPull">
      <div className="bg-[#1A1A1A] dark-card-bg border border-[#D4AF37]/50 rounded-full px-4 py-2 shadow-xl flex items-center gap-2.5 max-w-xs mx-auto text-xs font-semibold text-slate-200">
        {showSuccessToast ? (
          <>
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="text-emerald-400 font-bold">Agenda atualizada!</span>
          </>
        ) : isRefreshing ? (
          <>
            <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
            <span className="gold-text-gradient font-bold">Atualizando dados do Supabase...</span>
          </>
        ) : (
          <>
            <RefreshCw
              className={`w-4 h-4 text-[#D4AF37] transition-transform duration-200 ${
                isTriggered ? 'rotate-180 text-emerald-400' : ''
              }`}
              style={{ transform: `rotate(${Math.min(pullDistance * 3, 180)}deg)` }}
            />
            <span className={isTriggered ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
              {isTriggered ? 'Solte para atualizar' : 'Arraste para atualizar'}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
