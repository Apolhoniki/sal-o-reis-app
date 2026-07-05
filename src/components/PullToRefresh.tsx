import React, { useState, useRef } from 'react';
import { RefreshCw, ArrowDown, Sparkles } from 'lucide-react';
import { ThemeMode } from '../types';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  themeMode?: ThemeMode;
  theme?: 'preto' | 'branco';
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  themeMode,
  theme = 'preto',
  children,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const threshold = 65;

  const activeThemeMode = themeMode || (theme === 'branco' ? 'branco-luxo' : 'preto-luxo');

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only capture pull gesture if user is scrolled to top of page
    if (window.scrollY <= 2) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    if (diff > 0 && window.scrollY <= 2) {
      // Apply elastic damping formula
      const distance = Math.min(100, Math.pow(diff, 0.82));
      setPullDistance(distance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);

      try {
        await Promise.all([
          onRefresh(),
          new Promise((resolve) => setTimeout(resolve, 750)), // smooth min animation delay
        ]);
      } catch (err) {
        console.error('[PullToRefresh] Error refreshing data:', err);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-screen"
    >
      {/* Pull-to-Refresh Floating Feedback Pill */}
      <div
        className="fixed top-14 left-0 right-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-200"
        style={{
          transform: `translateY(${
            isRefreshing ? '12px' : pullDistance > 0 ? `${pullDistance * 0.65}px` : '-120px'
          })`,
          opacity: isRefreshing || pullDistance > 10 ? 1 : 0,
        }}
      >
        <div
          className={`px-4 py-2 rounded-full border shadow-2xl flex items-center gap-2.5 text-xs font-bold transition-all ${
            activeThemeMode === 'branco-luxo'
              ? 'bg-white border-[#D4AF37] text-slate-900 shadow-slate-300/60'
              : 'bg-[#1A1A1A] border-[#D4AF37] text-[#D4AF37] shadow-[0_8px_25px_rgba(212,175,55,0.35)]'
          }`}
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
              <span className="gold-text-gradient">Atualizando agenda com Supabase...</span>
            </>
          ) : pullDistance >= threshold ? (
            <>
              <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
              <span>Solte para atualizar</span>
            </>
          ) : (
            <>
              <ArrowDown
                className="w-4 h-4 text-[#D4AF37] transition-transform duration-150"
                style={{
                  transform: `rotate(${Math.min(180, (pullDistance / threshold) * 180)}deg)`,
                }}
              />
              <span>Puxe para atualizar</span>
            </>
          )}
        </div>
      </div>

      {children}
    </div>
  );
};
