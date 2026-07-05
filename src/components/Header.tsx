import React, { useRef } from 'react';
import { Crown, Sparkles, LogOut, Bell, Sun, Moon, RefreshCw } from 'lucide-react';
import { SALAO_NAME } from '../data/mockData';
import { ThemeMode } from '../types';

interface HeaderProps {
  isAdmin: boolean;
  onExitAdmin: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  isSmartphoneFrame: boolean;
  onToggleFrame: () => void;
  onTripleClickTitle?: () => void;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
  onRefreshData?: () => Promise<void>;
  isRefreshingData?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  onExitAdmin,
  unreadCount,
  onOpenNotifications,
  isSmartphoneFrame,
  onToggleFrame,
  onTripleClickTitle,
  themeMode = 'preto-luxo',
  onToggleTheme,
  onRefreshData,
  isRefreshingData = false,
}) => {
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  const handleTitleClick = () => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < 500) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
    }
    lastClickTimeRef.current = now;

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      if (onTripleClickTitle) {
        onTripleClickTitle();
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#121212] border-b border-[#2A2A2A] px-4 py-3.5 shadow-2xl transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div
          onClick={handleTitleClick}
          className="flex items-center gap-2.5 cursor-pointer select-none group active:scale-95 transition-transform"
          title="Salão Reis - Clique 3x para acesso restrito do profissional"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1a1a1a] border border-[#D4AF37] flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.4)] group-hover:border-[#F5E08B] transition-colors">
            <img
              src="/icon-192.png?v=2.0"
              alt="Salão Reis Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="font-cinzel text-lg font-bold tracking-[0.2em] text-[#D4AF37] uppercase leading-none group-hover:text-[#F5E08B] transition-colors">
              {SALAO_NAME}
            </h1>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-medium block mt-1">
              Excelência em cada detalhe
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle Button ("Preto Luxo" vs "Branco Luxo") */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-full border transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                themeMode === 'branco-luxo'
                  ? 'bg-amber-100 border-[#D4AF37] text-[#0F172A] hover:bg-amber-200'
                  : 'bg-[#1A1A1A] border-[#2A2A2A] text-amber-400 hover:border-[#D4AF37]/60'
              }`}
              title={themeMode === 'preto-luxo' ? 'Mudar para Tema Branco Luxo' : 'Mudar para Tema Preto Luxo'}
            >
              {themeMode === 'preto-luxo' ? (
                <Moon className="w-4 h-4 text-[#D4AF37]" />
              ) : (
                <Sun className="w-4 h-4 text-amber-600 fill-amber-500/20" />
              )}
            </button>
          )}

          {/* Refresh Data Button */}
          {onRefreshData && (
            <button
              onClick={() => onRefreshData()}
              disabled={isRefreshingData}
              className={`p-2 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all active:scale-95 ${
                isRefreshingData ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Atualizar Agenda em Tempo Real (Supabase)"
            >
              <RefreshCw className={`w-4 h-4 text-[#D4AF37] ${isRefreshingData ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Notifications button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-gray-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all active:scale-95"
            title="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] text-black font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Toggle Smartphone Frame (for desktop preview ease) */}
          <button
            onClick={onToggleFrame}
            className="hidden sm:flex p-2 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-gray-400 hover:text-slate-200 transition-all text-xs items-center gap-1"
            title="Alternar Moldura de Celular"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </button>

          {/* Exit Admin Button - ONLY visible when Adson is unlocked in Admin Mode */}
          {isAdmin && (
            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 font-bold text-xs transition-all shadow-md active:scale-95"
              title="Sair do Modo Administrativo e voltar à visão do cliente"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sair Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

