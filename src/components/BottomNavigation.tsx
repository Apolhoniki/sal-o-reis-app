import React, { useState } from 'react';
import { Calendar, Image as ImageIcon, Bell, User, Settings, MessageSquare, Phone, X, Zap } from 'lucide-react';
import { ActiveTab } from '../types';
import { ADSON_WHATSAPP_NUMBER, ADSON_PHONE } from '../data/mockData';

interface BottomNavigationProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  unreadNotificationsCount: number;
  isAdmin: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChangeTab,
  unreadNotificationsCount,
  isAdmin,
}) => {
  const [isFabOpen, setIsFabOpen] = useState(false);

  const handleCallAdson = () => {
    setIsFabOpen(false);
    window.open(`tel:${ADSON_PHONE}`, '_self');
  };

  const handleWhatsAppAdson = () => {
    setIsFabOpen(false);
    const url = `https://wa.me/${ADSON_WHATSAPP_NUMBER}?text=${encodeURIComponent('Oi, Adson! Estou no aplicativo do Salão Reis e gostaria de tirar uma dúvida rápida.')}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Floating Action Button Menu overlay */}
      {isFabOpen && (
        <div
          onClick={() => setIsFabOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* FAB Quick Action Menu Popover */}
      {isFabOpen && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2.5 animate-fadeIn">
          <button
            onClick={handleCallAdson}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#1A1A1A] border border-[#D4AF37]/50 text-slate-100 text-xs font-bold shadow-2xl hover:bg-[#252525] active:scale-95 transition-all group"
          >
            <span>Ligar para Adson</span>
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shadow-md">
              <Phone className="w-4 h-4 text-black fill-black stroke-none" />
            </div>
          </button>

          <button
            onClick={handleWhatsAppAdson}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#1A1A1A] border border-emerald-500/50 text-slate-100 text-xs font-bold shadow-2xl hover:bg-[#252525] active:scale-95 transition-all group"
          >
            <span>Enviar Mensagem no WhatsApp</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-md">
              <MessageSquare className="w-4 h-4 text-slate-950 fill-slate-950 stroke-none" />
            </div>
          </button>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsFabOpen(!isFabOpen)}
        className={`fixed bottom-20 right-4 z-50 w-13 h-13 rounded-full flex items-center justify-center shadow-[0_4px_25px_rgba(212,175,55,0.4)] transition-all active:scale-90 group border ${
          isFabOpen
            ? 'bg-rose-600 border-rose-400 text-white rotate-90'
            : 'bg-[#D4AF37] border-[#F5E08B] text-black hover:brightness-110'
        }`}
        title="Ação Rápida de Contato"
      >
        {isFabOpen ? (
          <X className="w-6 h-6 stroke-[2.5]" />
        ) : (
          <Zap className="w-6 h-6 fill-black stroke-none group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Main Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0f12]/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          {/* Tab 1: Agendar */}
          <button
            onClick={() => onChangeTab('agendar')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'agendar'
                ? 'text-[#d4af37] font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className={`w-5 h-5 mb-0.5 ${activeTab === 'agendar' ? 'text-[#d4af37]' : ''}`} />
            <span className="text-[10px] uppercase font-semibold tracking-wider">Agendar</span>
          </button>

          {/* Tab 2: Portfólio */}
          <button
            onClick={() => onChangeTab('portfolio')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'portfolio'
                ? 'text-[#d4af37] font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className={`w-5 h-5 mb-0.5 ${activeTab === 'portfolio' ? 'text-[#d4af37]' : ''}`} />
            <span className="text-[10px] uppercase font-semibold tracking-wider">Portfólio</span>
          </button>

          {/* Tab 3: Notificações */}
          <button
            onClick={() => onChangeTab('notificacoes')}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'notificacoes'
                ? 'text-[#d4af37] font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Bell className={`w-5 h-5 mb-0.5 ${activeTab === 'notificacoes' ? 'text-[#d4af37]' : ''}`} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-amber-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center shadow">
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-wider">Avisos</span>
          </button>

          {/* Tab 4: Perfil */}
          <button
            onClick={() => onChangeTab('perfil')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'perfil'
                ? 'text-[#d4af37] font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className={`w-5 h-5 mb-0.5 ${activeTab === 'perfil' ? 'text-[#d4af37]' : ''}`} />
            <span className="text-[10px] uppercase font-semibold tracking-wider">Perfil</span>
          </button>

          {/* Tab 5: Admin (Adson) - ONLY visible when Adson unlocks admin mode */}
          {isAdmin && (
            <button
              onClick={() => onChangeTab('admin')}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                activeTab === 'admin'
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Settings className={`w-5 h-5 mb-0.5 ${activeTab === 'admin' ? 'text-amber-400' : ''}`} />
              <span className="text-[10px] uppercase font-semibold tracking-wider">Adson</span>
            </button>
          )}

        </div>
      </nav>
    </>
  );
};
