import React, { useState, useEffect, useCallback } from 'react';
import {
  DaySchedule,
  PortfolioItem,
  ServiceItem,
  BookingRequest,
  ClientHistoryItem,
  AppNotification,
  ActiveTab,
  Period,
  AdsonProfileInfo,
  ThemeMode,
} from './types';
import {
  INITIAL_DAYS,
  INITIAL_PORTFOLIO,
  INITIAL_SERVICES,
  INITIAL_BOOKINGS,
  INITIAL_CLIENT_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROFILE_INFO,
  SALAO_NAME,
} from './data/mockData';
import { isSupabaseConfigured } from './lib/supabase';
import {
  fetchProfileInfoFromSupabase,
  saveProfileInfoToSupabase,
  fetchDaysFromSupabase,
  saveDayScheduleToSupabase,
  saveBulkDaysToSupabase,
  fetchBookingsFromSupabase,
  createBookingInSupabase,
  updateBookingStatusInSupabase,
  fetchClientsFromSupabase,
  saveClientToSupabase,
  deleteClientFromSupabase,
  deleteClientGroupFromSupabase,
  fetchNotificationsFromSupabase,
  createNotificationInSupabase,
  markAllNotificationsReadInSupabase,
  subscribeToRealtimeUpdates,
} from './services/supabaseService';
import { Header } from './components/Header';
import { DayCard } from './components/DayCard';
import { BookingDrawer } from './components/BookingDrawer';
import { DesignOptionsModal } from './components/DesignOptionsModal';
import { PortfolioFeed } from './components/PortfolioFeed';
import { AdminPanel } from './components/AdminPanel';
import { NotificationCenter } from './components/NotificationCenter';
import { ProfileView } from './components/ProfileView';
import { BottomNavigation } from './components/BottomNavigation';
import { PinModal } from './components/PinModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { DatePaginationControls } from './components/DatePaginationControls';
import { PullToRefresh } from './components/PullToRefresh';
import { parseDateFromId } from './utils/dateHelpers';
import { Sparkles, Calendar, Heart, ShieldAlert, ChevronRight, MessageSquare } from 'lucide-react';

export default function App() {
  // Theme State ("Preto Luxo" | "Branco Luxo")
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem('salao_reis_theme_mode') || localStorage.getItem('salao_reis_theme');
      if (savedTheme === 'branco-luxo' || savedTheme === 'branco') {
        return 'branco-luxo';
      }
    } catch (e) {
      console.error('Error loading theme from localStorage:', e);
    }
    return 'preto-luxo';
  });

  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [isDesignOptionsOpen, setIsDesignOptionsOpen] = useState(false);

  useEffect(() => {
    const allThemeClasses = [
      'dark',
      'theme-preto-luxo',
      'theme-branco-luxo',
      'theme-ametista-real',
      'theme-esmeralda-imperial',
      'theme-safira-midnight',
      'theme-branco',
      'theme-preto'
    ];
    allThemeClasses.forEach((cls) => {
      document.body.classList.remove(cls);
      document.documentElement.classList.remove(cls);
    });

    document.body.classList.add(`theme-${themeMode}`);
    document.documentElement.classList.add(`theme-${themeMode}`);

    if (themeMode === 'branco-luxo') {
      document.body.classList.add('theme-branco-luxo', 'theme-branco');
      document.documentElement.classList.add('theme-branco-luxo', 'theme-branco');
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    } else {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
      if (themeMode === 'preto-luxo') {
        document.body.classList.add('theme-preto-luxo');
        document.documentElement.classList.add('theme-preto-luxo');
      }
    }
  }, [themeMode]);

  const handleSelectTheme = (newTheme: ThemeMode) => {
    setThemeMode(newTheme);
    try {
      localStorage.setItem('salao_reis_theme_mode', newTheme);
      localStorage.setItem('salao_reis_theme', newTheme === 'branco-luxo' ? 'branco' : 'preto');
    } catch (e) {
      console.error('Error saving theme to localStorage:', e);
    }
  };

  const handleToggleTheme = () => {
    const themeCycle: ThemeMode[] = [
      'preto-luxo',
      'branco-luxo',
      'ametista-real',
      'esmeralda-imperial',
      'safira-midnight'
    ];
    const currentIndex = themeCycle.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % themeCycle.length;
    handleSelectTheme(themeCycle[nextIndex]);
  };

  // App State
  const [days, setDays] = useState<DaySchedule[]>(INITIAL_DAYS);
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>('2026-07');
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(INITIAL_PORTFOLIO);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [bookings, setBookings] = useState<BookingRequest[]>(INITIAL_BOOKINGS);
  const [history, setHistory] = useState<ClientHistoryItem[]>(INITIAL_CLIENT_HISTORY);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [profileInfo, setProfileInfo] = useState<AdsonProfileInfo>(() => {
    try {
      const saved = localStorage.getItem('salao_reis_profile_info');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading profile info from localStorage:', e);
    }
    return INITIAL_PROFILE_INFO;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('agendar');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Saved Client Profile State from LocalStorage
  const [savedClientName, setSavedClientName] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('salao_reis_client_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.clientName || null;
      }
    } catch (e) {
      return null;
    }
    return null;
  });

  const [savedClientPhone, setSavedClientPhone] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('salao_reis_client_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.clientPhone || null;
      }
    } catch (e) {
      return null;
    }
    return null;
  });

  // Supabase Data Initialization & Realtime Subscription
  const loadSupabaseData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    try {
      const remoteProfile = await fetchProfileInfoFromSupabase();
      if (remoteProfile) {
        setProfileInfo(remoteProfile);
      }

      const remoteDays = await fetchDaysFromSupabase();
      if (remoteDays && remoteDays.length > 0) {
        setDays(remoteDays);
      } else {
        await saveBulkDaysToSupabase(INITIAL_DAYS);
      }

      const remoteBookings = await fetchBookingsFromSupabase();
      if (remoteBookings) {
        setBookings(remoteBookings);
      }

      const remoteClients = await fetchClientsFromSupabase();
      if (remoteClients) {
        setHistory(remoteClients);
      }

      const remoteNotifs = await fetchNotificationsFromSupabase(savedClientPhone || undefined, isAdmin);
      if (remoteNotifs) {
        setNotifications(remoteNotifs);
      }
    } catch (err) {
      console.error('[App] Error loading Supabase data:', err);
    }
  }, [savedClientPhone, isAdmin]);

  const handleRefreshData = useCallback(async () => {
    setIsRefreshingData(true);
    try {
      await loadSupabaseData();
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setIsRefreshingData(false);
    }
  }, [loadSupabaseData]);

  useEffect(() => {
    loadSupabaseData();

    // Subscribe to Supabase Realtime changes across connected client devices
    const unsubscribe = subscribeToRealtimeUpdates({
      onProfileChange: (updatedProfile) => {
        setProfileInfo(updatedProfile);
      },
      onDaysChange: async () => {
        const remoteDays = await fetchDaysFromSupabase();
        if (remoteDays) setDays(remoteDays);
      },
      onBookingsChange: async () => {
        const remoteBookings = await fetchBookingsFromSupabase();
        if (remoteBookings) setBookings(remoteBookings);
      },
      onClientsChange: async () => {
        const remoteClients = await fetchClientsFromSupabase();
        if (remoteClients) setHistory(remoteClients);
      },
      onNotificationsChange: async () => {
        const remoteNotifs = await fetchNotificationsFromSupabase(savedClientPhone || undefined, isAdmin);
        if (remoteNotifs) setNotifications(remoteNotifs);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [loadSupabaseData, savedClientPhone, isAdmin]);

  const handleUpdateProfileInfo = (updatedInfo: AdsonProfileInfo) => {
    setProfileInfo(updatedInfo);
    saveProfileInfoToSupabase(updatedInfo);
    try {
      localStorage.setItem('salao_reis_profile_info', JSON.stringify(updatedInfo));
    } catch (e) {
      console.error('Error saving profile info to localStorage:', e);
    }
  };

  const handleExitAdmin = () => {
    setIsAdmin(false);
    if (activeTab === 'admin') {
      setActiveTab('agendar');
    }
  };

  // Booking Drawer State
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [preselectedPhoto, setPreselectedPhoto] = useState<string | undefined>(undefined);

  // Smartphone Frame Simulation Toggle
  const [isSmartphoneFrame, setIsSmartphoneFrame] = useState(true);

  // Filtered Days by Month & Page (Página 1: Dias 1-15 | Página 2: Dias 16-31)
  const filteredDays = days.filter((day) => {
    const { year, month, day: dayNum } = parseDateFromId(day.id);
    const ymKey = `${year}-${month.toString().padStart(2, '0')}`;
    if (ymKey !== selectedYearMonth) return false;

    if (selectedPage === 1) {
      return dayNum >= 1 && dayNum <= 15;
    } else {
      return dayNum >= 16;
    }
  });

  // Recalculate status for a day based on period availability & extra slots
  const updateDayStatus = (d: DaySchedule): DaySchedule => {
    if (d.isBlocked) {
      return {
        ...d,
        status: 'vermelho',
        statusLabel: 'NÃO HÁ HORÁRIOS DISPONÍVEIS HOJE',
      };
    }

    const { manha, tarde, noite } = d.periods;
    const extra = d.extraSlots || {};

    const manhaAvail = manha || !!extra.manha;
    const tardeAvail = tarde || !!extra.tarde;
    const noiteAvail = noite || !!extra.noite;

    const standardCount = (manha ? 1 : 0) + (tarde ? 1 : 0) + (noite ? 1 : 0);
    const totalCount = (manhaAvail ? 1 : 0) + (tardeAvail ? 1 : 0) + (noiteAvail ? 1 : 0);
    const hasAnyExtraSlot = !!(extra.manha || extra.tarde || extra.noite);

    if (standardCount === 3 && !hasAnyExtraSlot) {
      return {
        ...d,
        status: 'verde',
        statusLabel: 'DISPONÍVEL: Manhã, Tarde e Noite',
      };
    } else if (totalCount === 0) {
      return {
        ...d,
        status: 'vermelho',
        statusLabel: 'NÃO HÁ HORÁRIOS DISPONÍVEIS HOJE',
      };
    } else {
      const freePeriods: string[] = [];
      if (manhaAvail) freePeriods.push(extra.manha ? 'Manhã (Encaixe ⚡)' : 'Manhã');
      if (tardeAvail) freePeriods.push(extra.tarde ? 'Tarde (Encaixe ⚡)' : 'Tarde');
      if (noiteAvail) freePeriods.push(extra.noite ? 'Noite (Encaixe ⚡)' : 'Noite');

      return {
        ...d,
        status: 'amarelo',
        statusLabel: hasAnyExtraSlot
          ? `VAGA EXTRA (ENCAIXE): ${freePeriods.join(', ')}`
          : `DISPONÍVEL APENAS: ${freePeriods.join(' e ')}`,
      };
    }
  };

  // Handlers for Day Selection & Booking
  const handleSelectDay = (day: DaySchedule) => {
    setSelectedDay(day);
    setIsDrawerOpen(true);
  };

  const handleConfirmBooking = (bookingData: {
    clientName: string;
    clientPhone: string;
    clientDescription?: string;
    dateId: string;
    dayFormatted: string;
    period: Period;
    referenceImageUrl?: string;
    inspirationImageUrl?: string;
    currentHairImageUrl?: string;
  }) => {
    if (bookingData.clientName) {
      setSavedClientName(bookingData.clientName);
    }
    if (bookingData.clientPhone) {
      setSavedClientPhone(bookingData.clientPhone);
      try {
        localStorage.setItem(
          'salao_reis_client_profile',
          JSON.stringify({ clientName: bookingData.clientName, clientPhone: bookingData.clientPhone })
        );
      } catch (e) {
        console.error('Error saving client profile:', e);
      }
    }

    const newBooking: BookingRequest = {
      id: `bk-${Date.now()}`,
      clientName: bookingData.clientName,
      clientPhone: bookingData.clientPhone,
      clientDescription: bookingData.clientDescription,
      dateId: bookingData.dateId,
      dayFormatted: bookingData.dayFormatted,
      period: bookingData.period,
      referenceImageUrl: bookingData.inspirationImageUrl || bookingData.referenceImageUrl,
      inspirationImageUrl: bookingData.inspirationImageUrl || bookingData.referenceImageUrl,
      currentHairImageUrl: bookingData.currentHairImageUrl,
      status: 'pendente',
      createdAt: 'Hoje, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setBookings((prev) => [newBooking, ...prev]);
    createBookingInSupabase(newBooking);

    // Hold period in schedule & clear any active extra slot to prevent double-booking
    setDays((prev) =>
      prev.map((d) => {
        if (d.id === bookingData.dateId) {
          const updatedPeriods = {
            ...d.periods,
            [bookingData.period]: false,
          };
          const updatedExtra = {
            ...d.extraSlots,
            [bookingData.period]: false,
          };
          const updatedDay = updateDayStatus({ ...d, periods: updatedPeriods, extraSlots: updatedExtra });
          saveDayScheduleToSupabase(updatedDay);
          return updatedDay;
        }
        return d;
      })
    );

    // Add confirmation notification specifically for this client phone
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Solicitação Enviada com Sucesso!',
      message: `Você solicitou agendamento para ${bookingData.dayFormatted} (${bookingData.period.toUpperCase()}). Aguarde a confirmação de horário do Adson.`,
      timestamp: 'Agora',
      read: false,
      type: 'confirmation',
      clientPhone: bookingData.clientPhone,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    createNotificationInSupabase(newNotif);
  };

  // Admin Handler: Confirm booking with exact time
  const handleAdminConfirmBooking = (bookingId: string, exactTime: string) => {
    let confirmedDayId = '';
    let confirmedPeriod: Period = 'tarde';
    let clientName = '';
    let clientPhone = '';
    let dayFormatted = '';

    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (targetBooking) {
      clientName = targetBooking.clientName;
      clientPhone = targetBooking.clientPhone;
      dayFormatted = targetBooking.dayFormatted;
    }

    setBookings((prev) =>
      prev.map((bk) => {
        if (bk.id === bookingId) {
          confirmedDayId = bk.dateId;
          confirmedPeriod = bk.period;
          return {
            ...bk,
            status: 'confirmado',
            confirmedTime: exactTime,
          };
        }
        return bk;
      })
    );

    updateBookingStatusInSupabase(bookingId, 'confirmado', exactTime);

    if (confirmedDayId) {
      setDays((prev) =>
        prev.map((d) => {
          if (d.id === confirmedDayId) {
            const updatedPeriods = {
              ...d.periods,
              [confirmedPeriod]: false,
            };
            const updatedExtra = {
              ...d.extraSlots,
              [confirmedPeriod]: false,
            };
            const updatedDay = updateDayStatus({ ...d, periods: updatedPeriods, extraSlots: updatedExtra });
            saveDayScheduleToSupabase(updatedDay);
            return updatedDay;
          }
          return d;
        })
      );
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Agendamento Confirmado!',
      message: `Olá, ${clientName}! Seu agendamento para ${dayFormatted} foi CONFIRMADO com o Adson Reis para às ${exactTime}.`,
      timestamp: 'Agora',
      read: false,
      type: 'confirmation',
      clientPhone: clientPhone,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    createNotificationInSupabase(newNotif);
  };

  // Handler for Adson opening/closing extra slot (Vaga Extra / Encaixe)
  const handleToggleExtraSlot = (dateId: string, period: Period) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id === dateId) {
          const currentExtra = d.extraSlots?.[period] || false;
          const updatedExtra = {
            ...d.extraSlots,
            [period]: !currentExtra,
          };
          const updatedDay = updateDayStatus({
            ...d,
            extraSlots: updatedExtra,
            isBlocked: false,
          });
          saveDayScheduleToSupabase(updatedDay);
          return updatedDay;
        }
        return d;
      })
    );

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Vaga Extra Liberada!',
      message: `Status de Vaga Extra (Encaixe) para o período da ${period.toUpperCase()} foi atualizado no app.`,
      timestamp: 'Agora',
      read: false,
      type: 'system',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Admin Handler: Change Booking Status
  const handleUpdateBookingStatus = (bookingId: string, status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado') => {
    setBookings((prev) =>
      prev.map((bk) => (bk.id === bookingId ? { ...bk, status } : bk))
    );
    updateBookingStatusInSupabase(bookingId, status);
  };

  // Admin Handler: Toggle Period Block
  const handleTogglePeriodBlock = (dayId: string, period: Period) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id === dayId) {
          const updatedPeriods = {
            ...d.periods,
            [period]: !d.periods[period],
          };
          const updatedDay = updateDayStatus({ ...d, periods: updatedPeriods, isBlocked: false });
          saveDayScheduleToSupabase(updatedDay);
          return updatedDay;
        }
        return d;
      })
    );
  };

  // Admin Handler: Toggle Day Block
  const handleToggleDayBlock = (dayId: string) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id === dayId) {
          const isNowBlocked = !d.isBlocked;
          const updatedDay = updateDayStatus({
            ...d,
            isBlocked: isNowBlocked,
            periods: isNowBlocked
              ? { manha: false, tarde: false, noite: false }
              : { manha: true, tarde: true, noite: true },
          });
          saveDayScheduleToSupabase(updatedDay);
          return updatedDay;
        }
        return d;
      })
    );
  };

  // Admin Handler: Add client history
  const handleAddClientHistory = (item: Omit<ClientHistoryItem, 'id'>) => {
    const newHistoryItem: ClientHistoryItem = {
      ...item,
      id: `hist-${Date.now()}`,
    };
    setHistory((prev) => [newHistoryItem, ...prev]);
    saveClientToSupabase(newHistoryItem);
  };

  // Admin Handler: Delete client history
  const handleDeleteClientHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    deleteClientFromSupabase(id);
  };

  // Admin Handler: Delete client group
  const handleDeleteClientGroup = (clientName: string) => {
    setHistory((prev) => prev.filter((item) => item.clientName.trim().toLowerCase() !== clientName.trim().toLowerCase()));
    deleteClientGroupFromSupabase(clientName);
  };

  // Admin Handler: Add portfolio item
  const handleAddPortfolioItem = (item: Omit<PortfolioItem, 'id'>) => {
    const newPortItem: PortfolioItem = {
      ...item,
      id: `port-${Date.now()}`,
    };
    setPortfolio((prev) => [newPortItem, ...prev]);
  };

  // Admin Handler: Update portfolio item
  const handleUpdatePortfolioItem = (updatedItem: PortfolioItem) => {
    setPortfolio((prev) =>
      prev.map((p) => (p.id === updatedItem.id ? updatedItem : p))
    );
  };

  // Admin Handler: Delete portfolio item
  const handleDeletePortfolioItem = (id: string) => {
    setPortfolio((prev) => prev.filter((p) => p.id !== id));
  };

  // Admin Handler: Service Management
  const handleAddService = (newSrv: Omit<ServiceItem, 'id'>) => {
    const srv: ServiceItem = {
      ...newSrv,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [...prev, srv]);
  };

  const handleDeleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <PullToRefresh onRefresh={handleRefreshData} themeMode={themeMode}>
      <div className="min-h-screen bg-[#090b0e] text-slate-100 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 selection:bg-[#d4af37] selection:text-slate-950 font-sans">
        
        {/* Outer Container or Smartphone Shell Frame */}
        <div
          className={`w-full transition-all duration-300 ${
            isSmartphoneFrame
              ? 'max-w-md my-0 sm:my-3 rounded-none sm:rounded-[40px] border-0 sm:border-8 border-slate-800/90 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden bg-[#0d0f12] relative min-h-screen sm:min-h-[840px] flex flex-col'
              : 'max-w-2xl bg-[#0d0f12] min-h-screen rounded-none sm:rounded-3xl border-0 sm:border border-slate-800/80 p-0 shadow-2xl relative flex flex-col'
          }`}
        >
          {/* Fixed Header */}
          <Header
            isAdmin={isAdmin}
            onExitAdmin={handleExitAdmin}
            unreadCount={unreadNotificationsCount}
            onOpenNotifications={() => setActiveTab('notificacoes')}
            isSmartphoneFrame={isSmartphoneFrame}
            onToggleFrame={() => setIsSmartphoneFrame(!isSmartphoneFrame)}
            onTripleClickTitle={() => setIsPinModalOpen(true)}
            themeMode={themeMode}
            onToggleTheme={handleToggleTheme}
            onOpenDesignOptions={() => setIsDesignOptionsOpen(true)}
            onRefreshData={handleRefreshData}
            isRefreshingData={isRefreshingData}
          />

        {/* Main Content View Container */}
        <main className="flex-1 p-4 overflow-y-auto relative">
          
          {/* TAB 1: AGENDAR (Format: Vertical List feed of large Day Cards) */}
          {activeTab === 'agendar' && (
            <div className="pb-24 space-y-4 animate-fadeIn">
              
              {/* Returning Client Banner */}
              {savedClientName && (
                <div className="bg-amber-950/40 border border-amber-500/40 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-extrabold text-sm shadow">
                      {savedClientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-amber-300">
                        Olá, {savedClientName}!
                      </h3>
                      <p className="text-[11px] text-slate-300">
                        Selecione o dia do seu agendamento abaixo.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Inspiration Banner */}
              <div className="dark-card-bg rounded-2xl p-4 border border-[#d4af37]/30 flex items-center justify-between gap-3 shadow-lg">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider gold-text-gradient block mb-0.5">
                    Atendimento Exclusivo
                  </span>
                  <h2 className="font-cinzel text-base font-bold text-slate-100">
                    Escolha o melhor dia para você
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Role a tela e toque em um dia verde ou amarelo para selecionar.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className="shrink-0 p-2.5 rounded-xl gold-bg-gradient text-slate-950 font-bold text-xs flex items-center gap-1 shadow hover:brightness-110 active:scale-95"
                  title="Ver Portfólio de Referências"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span className="hidden sm:inline">Inspirações</span>
                </button>
              </div>

              {/* Status Semáforo Legend */}
              <div className="flex items-center justify-around py-2.5 px-3 dark-inner-card rounded-xl border border-[#D4AF37]/30 text-[11px] font-semibold text-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 green-status-glow" />
                  <span>Disponível</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 yellow-status-glow" />
                  <span>Parcial</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 red-status-glow" />
                  <span>Sem Vagas</span>
                </div>
              </div>

              {/* Date Pagination Controls (Limites por Mês: Página 1 = Dia 1 ao 15 | Página 2 = Dia 16 ao Fim) */}
              <DatePaginationControls
                days={days}
                selectedYearMonth={selectedYearMonth}
                selectedPage={selectedPage}
                onSelectYearMonth={setSelectedYearMonth}
                onSelectPage={setSelectedPage}
              />

              {/* Active Page Indicator */}
              <div className="flex items-center justify-between px-1 text-xs font-bold text-amber-300/90">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Exibindo {selectedPage === 1 ? 'Página 1 (Dias 01 a 15)' : 'Página 2 (Dias 16 ao Fim do Mês)'}
                </span>
                <span className="text-slate-400 font-normal text-[11px]">
                  {filteredDays.length} {filteredDays.length === 1 ? 'dia' : 'dias'}
                </span>
              </div>

              {/* Day Schedule Vertical Feed Cards */}
              <div className="space-y-3 mt-1">
                {filteredDays.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                    Nenhum dia cadastrado para esta página do mês.
                  </div>
                ) : (
                  filteredDays.map((day) => (
                    <DayCard
                      key={day.id}
                      day={day}
                      isSelected={selectedDay?.id === day.id && isDrawerOpen}
                      onSelectDay={handleSelectDay}
                    />
                  ))
                )}
              </div>

              {/* Bottom Quick Banner to WhatsApp */}
              <div className="pt-4 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400 mb-2">Preferir falar direto com o Adson Reis?</p>
                <button
                  onClick={() => {
                    const cleanNumber = profileInfo.whatsapp.replace(/\D/g, '');
                    window.open(
                      `https://wa.me/${cleanNumber}?text=${encodeURIComponent('Oi, Adson! Gostaria de saber se tem alguma vaga especial esta semana.')}`,
                      '_blank'
                    );
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-800/80 text-emerald-300 font-semibold text-xs hover:bg-emerald-900 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Falar com o Adson no WhatsApp</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PORTFÓLIO */}
          {activeTab === 'portfolio' && (
            <PortfolioFeed
              portfolio={portfolio}
              whatsappNumber={profileInfo.whatsapp}
              onSelectPhotoForBooking={(photoUrl) => {
                setPreselectedPhoto(photoUrl);
              }}
              onGoToAgendar={() => setActiveTab('agendar')}
              isAdmin={isAdmin}
              onOpenAddPortfolioModal={() => setActiveTab('admin')}
              onUpdatePortfolioItem={handleUpdatePortfolioItem}
            />
          )}

          {/* TAB 3: NOTIFICAÇÕES */}
          {activeTab === 'notificacoes' && (
            <NotificationCenter
              notifications={notifications}
              onMarkAllRead={() => {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              }}
              onClear={() => setNotifications([])}
            />
          )}

          {/* TAB 4: PERFIL & SERVIÇOS */}
          {activeTab === 'perfil' && (
            <ProfileView
              profileInfo={profileInfo}
              services={services}
              isAdmin={isAdmin}
              onUpdateProfileInfo={handleUpdateProfileInfo}
              onAddService={handleAddService}
              onDeleteService={handleDeleteService}
              onSelectServiceToBook={(srvName) => {
                setActiveTab('agendar');
              }}
              themeMode={themeMode}
              onToggleTheme={handleToggleTheme}
            />
          )}

          {/* TAB 5: ADMIN (PAINEL DO ADSON) */}
          {activeTab === 'admin' && (
            <AdminPanel
              bookings={bookings}
              days={days}
              history={history}
              portfolio={portfolio}
              services={services}
              profileInfo={profileInfo}
              onConfirmBooking={handleAdminConfirmBooking}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onTogglePeriodBlock={handleTogglePeriodBlock}
              onToggleDayBlock={handleToggleDayBlock}
              onToggleExtraSlot={handleToggleExtraSlot}
              onAddClientHistory={handleAddClientHistory}
              onDeleteClientHistory={handleDeleteClientHistory}
              onDeleteClientGroup={handleDeleteClientGroup}
              onAddPortfolioItem={handleAddPortfolioItem}
              onUpdatePortfolioItem={handleUpdatePortfolioItem}
              onDeletePortfolioItem={handleDeletePortfolioItem}
              onUpdateProfileInfo={handleUpdateProfileInfo}
              onExitAdmin={handleExitAdmin}
            />
          )}
        </main>

        {/* Bottom Drawer Modal for Day & Period Selection */}
        <BookingDrawer
          day={selectedDay}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          preselectedPhoto={preselectedPhoto}
          whatsappNumber={profileInfo.whatsapp}
          onConfirmBooking={handleConfirmBooking}
        />

        {/* Sleek Mobile Bottom Tab Navigation */}
        <BottomNavigation
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'admin') setIsAdmin(true);
          }}
          unreadNotificationsCount={unreadNotificationsCount}
          isAdmin={isAdmin}
        />

        {/* Security PIN Modal for Admin Access */}
        <PinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={() => {
            setIsAdmin(true);
            setActiveTab('admin');
            setIsPinModalOpen(false);
          }}
        />

        {/* Design Options & Luxury Themes Modal */}
        <DesignOptionsModal
          isOpen={isDesignOptionsOpen}
          onClose={() => setIsDesignOptionsOpen(false)}
          currentTheme={themeMode}
          onSelectTheme={handleSelectTheme}
          isSmartphoneFrame={isSmartphoneFrame}
          onToggleFrame={() => setIsSmartphoneFrame(!isSmartphoneFrame)}
        />

        {/* PWA Mobile Installation Prompt Banner */}
        <PWAInstallPrompt />
      </div>
    </div>
    </PullToRefresh>
  );
}
