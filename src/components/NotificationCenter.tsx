import React from 'react';
import { Bell, CheckCircle2, Info, Clock, Check } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClear: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAllRead,
  onClear,
}) => {
  return (
    <div className="pb-28">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-cinzel text-lg font-bold gold-text-gradient flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Avisos & Notificações
          </h2>
          <p className="text-xs text-slate-400">Acompanhe a confirmação dos seus horários no Salão Reis</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-amber-400 font-semibold hover:underline flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            Marcar lidas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center dark-card-bg rounded-2xl border border-slate-800 text-slate-400 text-xs">
          Nenhuma notificação nova no momento.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all ${
                !n.read
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                  : 'dark-card-bg border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    n.type === 'confirmation'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {n.type === 'confirmation' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-100">{n.title}</h3>
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {n.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
