import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Lock,
  Unlock,
  CheckCircle,
  MessageCircle,
  Plus,
  Clock,
  Search,
  Settings,
  ShieldAlert,
  X,
  History,
  Image as ImageIcon,
  Video,
  Trash2,
  Filter,
  User,
  Phone,
  Instagram,
  MapPin,
  Check,
  Ban,
  Save,
  Sparkles,
  LogOut,
  Upload,
  Camera,
  Film,
  Tag,
  Pencil
} from 'lucide-react';
import { BookingRequest, DaySchedule, ClientHistoryItem, Period, PortfolioItem, ServiceItem, AdsonProfileInfo } from '../types';
import { ADSON_WHATSAPP_NUMBER, INITIAL_PROFILE_INFO } from '../data/mockData';
import { formatBRLCurrency } from '../utils/formatters';
import { PortfolioModal } from './PortfolioModal';
import { DatePaginationControls } from './DatePaginationControls';
import { parseDateFromId } from '../utils/dateHelpers';

const PRESET_TAGS = [
  { id: 'Mais Pedido', label: 'Mais Pedido', icon: '⭐' },
  { id: 'Mais Rápido', label: 'Mais Rápido', icon: '⚡' },
  { id: 'Menos Agressivo', label: 'Menos Agressivo', icon: '🍃' },
  { id: 'Com Botox', label: 'Com Botox', icon: '🧪' },
  { id: 'Com Química', label: 'Com Química', icon: '💈' },
  { id: 'Sem Química', label: 'Sem Química', icon: '🌱' },
  { id: 'Permanente', label: 'Permanente', icon: '♾️' },
  { id: 'Pouco Tempo', label: 'Pouco Tempo', icon: '⏱️' },
];

interface AdminPanelProps {
  bookings: BookingRequest[];
  days: DaySchedule[];
  history: ClientHistoryItem[];
  portfolio: PortfolioItem[];
  services: ServiceItem[];
  profileInfo: AdsonProfileInfo;
  onConfirmBooking: (bookingId: string, exactTime: string) => void;
  onUpdateBookingStatus: (bookingId: string, status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado') => void;
  onTogglePeriodBlock: (dayId: string, period: Period) => void;
  onToggleDayBlock: (dayId: string) => void;
  onToggleExtraSlot?: (dateId: string, period: Period) => void;
  onAddClientHistory: (item: Omit<ClientHistoryItem, 'id'>) => void;
  onDeleteClientHistory?: (id: string) => void;
  onDeleteClientGroup?: (clientName: string) => void;
  onAddPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => void;
  onUpdatePortfolioItem?: (item: PortfolioItem) => void;
  onDeletePortfolioItem: (id: string) => void;
  onUpdateProfileInfo: (info: AdsonProfileInfo) => void;
  onExitAdmin?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  bookings,
  days,
  history,
  portfolio,
  services,
  profileInfo,
  onConfirmBooking,
  onUpdateBookingStatus,
  onTogglePeriodBlock,
  onToggleDayBlock,
  onToggleExtraSlot,
  onAddClientHistory,
  onDeleteClientHistory,
  onDeleteClientGroup,
  onAddPortfolioItem,
  onUpdatePortfolioItem,
  onDeletePortfolioItem,
  onUpdateProfileInfo,
  onExitAdmin,
}) => {
  const [adminTab, setAdminTab] = useState<'requests' | 'clients' | 'blocking' | 'portfolio' | 'settings'>('requests');
  
  // Date Pagination State for Blocking Tab
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>('2026-07');
  const [selectedPage, setSelectedPage] = useState<number>(1);

  // Saved Client Profile Modal State (from Request card)
  const [saveClientModalBooking, setSaveClientModalBooking] = useState<BookingRequest | null>(null);
  const [saveClientName, setSaveClientName] = useState('');
  const [saveClientPhone, setSaveClientPhone] = useState('');
  const [saveClientDesc, setSaveClientDesc] = useState('');
  const [saveClientService, setSaveClientService] = useState('');

  // Clientes Salvos Tab States
  const [searchClientProfile, setSearchClientProfile] = useState('');
  const [selectedClientProfile, setSelectedClientProfile] = useState<{
    clientName: string;
    clientPhone: string;
    clientDescription: string;
    items: ClientHistoryItem[];
  } | null>(null);

  // Grouped Clients memo for "Clientes Salvos"
  const groupedClientsList = React.useMemo(() => {
    const map = new Map<string, { clientName: string; clientPhone: string; clientDescription: string; items: ClientHistoryItem[] }>();

    // Add from client history
    history.forEach((h) => {
      const key = h.clientName.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          clientName: h.clientName,
          clientPhone: h.clientPhone || '',
          clientDescription: h.clientDescription || h.notes || '',
          items: [h],
        });
      } else {
        const existing = map.get(key)!;
        existing.items.push(h);
        if (!existing.clientDescription && h.clientDescription) {
          existing.clientDescription = h.clientDescription;
        }
        if (!existing.clientPhone && h.clientPhone) {
          existing.clientPhone = h.clientPhone;
        }
      }
    });

    // Also include clients from bookings who may not be in history yet
    bookings.forEach((bk) => {
      const key = bk.clientName.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          clientName: bk.clientName,
          clientPhone: bk.clientPhone,
          clientDescription: bk.clientDescription || '',
          items: [],
        });
      } else {
        const existing = map.get(key)!;
        if (!existing.clientDescription && bk.clientDescription) {
          existing.clientDescription = bk.clientDescription;
        }
        if (!existing.clientPhone && bk.clientPhone) {
          existing.clientPhone = bk.clientPhone;
        }
      }
    });

    return Array.from(map.values());
  }, [history, bookings]);

  const filteredGroupedClients = groupedClientsList.filter((c) => {
    const term = searchClientProfile.toLowerCase();
    return (
      c.clientName.toLowerCase().includes(term) ||
      c.clientPhone.includes(term) ||
      c.clientDescription.toLowerCase().includes(term)
    );
  });

  const handleOpenSaveClientModal = (bk: BookingRequest) => {
    setSaveClientModalBooking(bk);
    setSaveClientName(bk.clientName);
    setSaveClientPhone(bk.clientPhone);
    setSaveClientDesc(bk.clientDescription || '');
    setSaveClientService(bk.serviceName || 'Agendamento Salão Reis');
  };

  const filteredDaysForAdmin = days.filter((day) => {
    const { year, month, day: dayNum } = parseDateFromId(day.id);
    const ymKey = `${year}-${month.toString().padStart(2, '0')}`;
    if (ymKey !== selectedYearMonth) return false;

    if (selectedPage === 1) {
      return dayNum >= 1 && dayNum <= 15;
    } else {
      return dayNum >= 16;
    }
  });
  
  // Filtering states for Booking History
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'confirmado' | 'concluido' | 'cancelado'>('todos');
  const [searchClient, setSearchClient] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Confirmation Modal state
  const [confirmModalBooking, setConfirmModalBooking] = useState<BookingRequest | null>(null);
  const [exactTimeInput, setExactTimeInput] = useState('15:30h');

  // Client History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [histClientName, setHistClientName] = useState('');
  const [histClientPhone, setHistClientPhone] = useState('');
  const [histDate, setHistDate] = useState('04/07/2026');
  const [histServiceName, setHistServiceName] = useState('Morena Iluminada');
  const [histNotes, setHistNotes] = useState('');
  const [histAmount, setHistAmount] = useState('R$ 380,00');

  // Portfolio Add/Edit Modal State
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);
  const [portTitle, setPortTitle] = useState('');
  const [portCategory, setPortCategory] = useState('Morena Iluminada');
  const [categoriesList, setCategoriesList] = useState<string[]>([
    'Morena Iluminada',
    'Mechas & Coloração',
    'Cortes Femininos',
    'Tratamento & Escova',
    'Penteados & Eventos',
  ]);
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Selected tags state
  const [selectedTags, setSelectedTags] = useState<string[]>(['Mais Pedido']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showCustomTagBox, setShowCustomTagBox] = useState(false);

  const [portMediaType, setPortMediaType] = useState<'image' | 'video'>('image');
  const [portImageUrl, setPortImageUrl] = useState('');
  const [portVideoUrl, setPortVideoUrl] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portPrice, setPortPrice] = useState('R$ 380,00');
  const [useUrlInput, setUseUrlInput] = useState(false);

  const handlePortPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBRLCurrency(e.target.value);
    setPortPrice(formatted);
  };

  const handleHistAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBRLCurrency(e.target.value);
    setHistAmount(formatted);
  };

  const handleMediaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isVideo) {
          setPortMediaType('video');
          setPortVideoUrl(result);
          if (!portImageUrl) {
            setPortImageUrl(result);
          }
        } else {
          setPortMediaType('image');
          setPortImageUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Account Settings Form State
  const [accName, setAccName] = useState(profileInfo.name || '');
  const [accTitle, setAccTitle] = useState(profileInfo.title || '');
  const [accBio, setAccBio] = useState(profileInfo.bio || '');
  const [accPhone, setAccPhone] = useState(profileInfo.phone || '');
  const [accWhatsapp, setAccWhatsapp] = useState(profileInfo.whatsapp || '');
  const [accInstagram, setAccInstagram] = useState(profileInfo.instagram || '');
  const [accAddress, setAccAddress] = useState(profileInfo.address || '');
  const [accHours, setAccHours] = useState(profileInfo.operatingHours || '');
  const [accAvatarUrl, setAccAvatarUrl] = useState(profileInfo.avatarUrl || '');

  React.useEffect(() => {
    setAccName(profileInfo.name || '');
    setAccTitle(profileInfo.title || '');
    setAccBio(profileInfo.bio || '');
    setAccPhone(profileInfo.phone || '');
    setAccWhatsapp(profileInfo.whatsapp || '');
    setAccInstagram(profileInfo.instagram || '');
    setAccAddress(profileInfo.address || '');
    setAccHours(profileInfo.operatingHours || '');
    setAccAvatarUrl(profileInfo.avatarUrl || '');
  }, [profileInfo]);

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setAccAvatarUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState(false);

  // Filter Bookings
  const filteredBookings = bookings.filter((bk) => {
    const matchesStatus = statusFilter === 'todos' || bk.status === statusFilter;
    const matchesClient =
      bk.clientName.toLowerCase().includes(searchClient.toLowerCase()) ||
      bk.clientPhone.includes(searchClient);
    const matchesDate = !dateFilter || bk.dayFormatted.toLowerCase().includes(dateFilter.toLowerCase());
    return matchesStatus && matchesClient && matchesDate;
  });

  const handleOpenWhatsAppToClient = (clientName: string, clientPhone: string, dayFormatted: string, period: Period) => {
    const periodLabel = period === 'manha' ? 'Manhã' : period === 'tarde' ? 'Tarde' : 'Noite';
    const message = `Olá, ${clientName}! Vi que você solicitou um agendamento para o período da ${periodLabel} no ${dayFormatted} pelo aplicativo do Salão Reis. Tudo bem? Gostaria de alinhar o horário exato com você!`;
    const cleanPhone = clientPhone.replace(/\D/g, '') || ADSON_WHATSAPP_NUMBER;
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSaveConfirmation = () => {
    if (confirmModalBooking && exactTimeInput.trim()) {
      onConfirmBooking(confirmModalBooking.id, exactTimeInput.trim());
      setConfirmModalBooking(null);
    }
  };

  const handleSavePortfolioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle.trim()) {
      alert('Por favor, informe o título do trabalho.');
      return;
    }
    if (!portImageUrl.trim()) {
      alert('Por favor, anexe uma foto ou vídeo da sua galeria antes de publicar.');
      return;
    }

    let finalCategory = portCategory;
    if (isAddingCustomCategory && customCategoryInput.trim()) {
      finalCategory = customCategoryInput.trim();
      if (!categoriesList.includes(finalCategory)) {
        setCategoriesList((prev) => [...prev, finalCategory]);
      }
    }

    const finalTags = [...selectedTags];
    if (customTagInput.trim() && !finalTags.includes(customTagInput.trim())) {
      finalTags.push(customTagInput.trim());
    }

    onAddPortfolioItem({
      title: portTitle,
      category: finalCategory,
      mediaType: portMediaType,
      imageUrl: portImageUrl,
      videoUrl: portMediaType === 'video' ? portVideoUrl : undefined,
      description: portDesc || 'Trabalho de transformação realizado por Adson no Salão Reis.',
      durationMinutes: 180,
      estimatedPrice: portPrice || 'R$ 0,00',
      isPopular: finalTags.includes('Mais Pedido'),
      tags: finalTags,
    });

    // Reset Form
    setPortTitle('');
    setPortImageUrl('');
    setPortVideoUrl('');
    setPortDesc('');
    setPortPrice('R$ 380,00');
    setSelectedTags(['Mais Pedido']);
    setIsAddingCustomCategory(false);
    setCustomCategoryInput('');
    setCustomTagInput('');
    setShowCustomTagBox(false);
    setShowPortfolioModal(false);
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfileInfo({
      ...profileInfo,
      name: accName,
      title: accTitle,
      bio: accBio,
      phone: accPhone,
      whatsapp: accWhatsapp,
      instagram: accInstagram,
      address: accAddress,
      operatingHours: accHours,
      avatarUrl: accAvatarUrl,
    });
    setSettingsSuccessMsg(true);
    setTimeout(() => setSettingsSuccessMsg(false), 3000);
  };

  return (
    <div className="pb-28">
      {/* Admin Top Header Banner */}
      <div className="dark-card-bg border border-[#D4AF37]/40 rounded-3xl p-4 mb-5 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#1A1A1A] border-2 border-[#D4AF37] flex items-center justify-center font-extrabold text-[#D4AF37] text-base shadow-md">
              AR
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-base text-slate-100 gold-text-gradient">
                Painel do Profissional (Adson)
              </h2>
              <p className="text-xs text-slate-400">Gerenciamento exclusivo de agenda, fotos e conta</p>
            </div>
          </div>

          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 font-bold text-xs transition-all active:scale-95 shadow-md shrink-0"
              title="Sair do Modo Admin e voltar à visão de cliente"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sair</span>
            </button>
          )}
        </div>

        {/* Tab Selector Navigation */}
        <div className="grid grid-cols-5 gap-1 mt-4 p-1 bg-[#121212] rounded-2xl border border-[#2A2A2A] text-xs">
          <button
            onClick={() => setAdminTab('requests')}
            className={`py-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              adminTab === 'requests'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className="text-[9px] sm:text-xs">Pedidos</span>
          </button>

          <button
            onClick={() => setAdminTab('clients')}
            className={`py-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              adminTab === 'clients'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="text-[9px] sm:text-xs">Clientes</span>
          </button>

          <button
            onClick={() => setAdminTab('blocking')}
            className={`py-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              adminTab === 'blocking'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[9px] sm:text-xs">Agenda</span>
          </button>

          <button
            onClick={() => setAdminTab('portfolio')}
            className={`py-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              adminTab === 'portfolio'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="text-[9px] sm:text-xs">Fotos</span>
          </button>

          <button
            onClick={() => setAdminTab('settings')}
            className={`py-2 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              adminTab === 'settings'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="text-[9px] sm:text-xs">Perfil</span>
          </button>
        </div>
      </div>

      {/* TAB 1: HISTÓRICO E SOLICITAÇÕES DE AGENDAMENTOS */}
      {adminTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel text-base font-bold text-slate-200 flex items-center gap-2">
              <History className="w-4 h-4 text-[#D4AF37]" />
              Histórico de Agendamentos ({filteredBookings.length})
            </h3>
          </div>

          {/* Filters Bar */}
          <div className="dark-card-bg p-3 rounded-2xl border border-[#2A2A2A] space-y-2.5">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar por nome da cliente ou telefone..."
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
              />
            </div>

            {/* Status Tabs Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {(['todos', 'pendente', 'confirmado', 'concluido', 'cancelado'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-full font-semibold capitalize shrink-0 transition-all ${
                    statusFilter === st
                      ? 'bg-[#D4AF37] text-black font-extrabold shadow'
                      : 'bg-[#1A1A1A] text-gray-400 hover:text-white border border-[#2A2A2A]'
                  }`}
                >
                  {st === 'todos' ? 'Todos' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List Cards */}
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center dark-card-bg rounded-2xl border border-[#2A2A2A] text-slate-400 text-xs">
              Nenhum agendamento encontrado para estes filtros.
            </div>
          ) : (
            filteredBookings.map((bk) => (
              <div
                key={bk.id}
                className="dark-card-bg rounded-2xl border border-[#2A2A2A] p-4 shadow-md space-y-3 hover:border-[#D4AF37]/50 transition-all"
              >
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      Solicitado em: {bk.createdAt}
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2 mt-0.5">
                      {bk.clientName}
                      <span className="text-xs font-normal text-gray-400">({bk.clientPhone})</span>
                    </h4>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                      bk.status === 'confirmado'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : bk.status === 'concluido'
                        ? 'bg-blue-950 text-blue-300 border-blue-800'
                        : bk.status === 'cancelado'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                    }`}
                  >
                    {bk.status === 'confirmado'
                      ? `Confirmado: ${bk.confirmedTime}`
                      : bk.status.toUpperCase()}
                  </span>
                </div>

                {/* Day & Period requested */}
                <div className="bg-[#1A1A1A] p-2.5 rounded-xl border border-[#2A2A2A] flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-semibold">{bk.dayFormatted}</span>
                  </div>
                  <span className="capitalize font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded border border-[#D4AF37]/20">
                    Período: {bk.period}
                  </span>
                </div>

                {/* Attached Media: Inspiração e Cabelo Atual Lado a Lado */}
                {(bk.inspirationImageUrl || bk.referenceImageUrl || bk.currentHairImageUrl) && (
                  <div className="bg-[#1A1A1A] p-3 rounded-xl border border-[#2A2A2A] space-y-2">
                    <span className="text-[11px] font-bold text-[#D4AF37] block">
                      📸 Fotos Anexadas pela Cliente:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Inspiração */}
                      {Boolean(bk.inspirationImageUrl || bk.referenceImageUrl) && (
                        <div className="bg-[#121212] p-2 rounded-lg border border-amber-500/40 flex flex-col items-center gap-1.5 text-center">
                          <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider bg-amber-950/90 px-2 py-0.5 rounded border border-amber-500/40 w-full truncate">
                            ✨ [Inspiração]
                          </span>
                          <img
                            src={(bk.inspirationImageUrl || bk.referenceImageUrl) || undefined}
                            alt="Foto Inspiração"
                            className="w-full h-24 rounded-lg object-cover border border-[#D4AF37]/40 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(bk.inspirationImageUrl || bk.referenceImageUrl, '_blank')}
                          />
                        </div>
                      )}

                      {/* Cabelo Atual */}
                      {Boolean(bk.currentHairImageUrl) && (
                        <div className="bg-[#121212] p-2 rounded-lg border border-emerald-500/40 flex flex-col items-center gap-1.5 text-center">
                          <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-500/40 w-full truncate">
                            💇‍♀️ [Cabelo Atual]
                          </span>
                          <img
                            src={bk.currentHairImageUrl || undefined}
                            alt="Foto Cabelo Atual"
                            className="w-full h-24 rounded-lg object-cover border border-emerald-500/40 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(bk.currentHairImageUrl, '_blank')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description sent by client if present */}
                {bk.clientDescription && (
                  <div className="bg-[#1A1A1A] p-2.5 rounded-xl border border-amber-500/30 text-xs text-amber-200">
                    <span className="font-bold text-amber-400 block text-[11px] mb-0.5">
                      💬 Quem é você / Descrição enviada:
                    </span>
                    "{bk.clientDescription}"
                  </div>
                )}

                {/* Save Client Profile Action */}
                <button
                  onClick={() => handleOpenSaveClientModal(bk)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>👤 Salvar Cliente no App</span>
                </button>

                {/* Status Controls & WhatsApp Action */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() =>
                      handleOpenWhatsAppToClient(bk.clientName, bk.clientPhone, bk.dayFormatted, bk.period)
                    }
                    className="py-2.5 px-3 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Cliente</span>
                  </button>

                  {bk.status === 'pendente' ? (
                    <button
                      onClick={() => setConfirmModalBooking(bk)}
                      className="py-2.5 px-3 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow hover:brightness-110 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmar Horário</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      {bk.status !== 'concluido' && (
                        <button
                          onClick={() => onUpdateBookingStatus(bk.id, 'concluido')}
                          className="py-2 px-2.5 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-semibold hover:bg-blue-900"
                          title="Marcar como Concluído"
                        >
                          Concluir
                        </button>
                      )}
                      {bk.status !== 'cancelado' && (
                        <button
                          onClick={() => onUpdateBookingStatus(bk.id, 'cancelado')}
                          className="py-2 px-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold hover:bg-rose-900"
                          title="Cancelar Agendamento"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Row: Open Extra Slot / Encaixe */}
                {onToggleExtraSlot && (
                  <div className="pt-2 border-t border-[#2A2A2A] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-400">Liberar 2ª vaga para este período?</span>
                    <button
                      onClick={() => onToggleExtraSlot(bk.dateId, bk.period)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow ${
                        days.find((d) => d.id === bk.dateId)?.extraSlots?.[bk.period]
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                          : 'bg-amber-950/80 hover:bg-amber-900 border-amber-700/80 text-amber-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        {days.find((d) => d.id === bk.dateId)?.extraSlots?.[bk.period]
                          ? 'Vaga Extra Aberta ⚡ (Fechar)'
                          : 'Abrir Vaga Extra ⚡'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: CLIENTES SALVOS COM PERFIL COMPLETO */}
      {adminTab === 'clients' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-cinzel text-base font-bold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4AF37]" />
              Clientes Salvas no App ({filteredGroupedClients.length})
            </h3>

            <button
              onClick={() => {
                setHistClientName('');
                setHistClientPhone('');
                setHistNotes('');
                setShowHistoryModal(true);
              }}
              className="py-2 px-3 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs flex items-center gap-1 shadow hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nova Cliente</span>
            </button>
          </div>

          {/* Search Client Profile */}
          <div className="dark-card-bg p-3 rounded-2xl border border-[#2A2A2A] flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por nome da cliente, telefone ou descrição..."
              value={searchClientProfile}
              onChange={(e) => setSearchClientProfile(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
            />
          </div>

          {/* List of Saved Clients */}
          <div className="space-y-3">
            {filteredGroupedClients.length === 0 ? (
              <div className="p-8 text-center dark-card-bg rounded-2xl border border-[#2A2A2A] text-slate-400 text-xs">
                Nenhuma cliente salva encontrada.
              </div>
            ) : (
              filteredGroupedClients.map((clientGroup) => (
                <div
                  key={clientGroup.clientName}
                  className="dark-card-bg rounded-2xl border border-[#2A2A2A] hover:border-[#D4AF37]/50 p-4 shadow-md space-y-3 transition-all"
                >
                  {/* Header: Name, Phone, Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center font-extrabold text-amber-300 text-sm shadow shrink-0">
                        {clientGroup.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                          {clientGroup.clientName}
                        </h4>
                        <p className="text-xs text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          {clientGroup.clientPhone || 'Sem telefone salvo'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {clientGroup.clientPhone && (
                        <button
                          onClick={() => {
                            const clean = clientGroup.clientPhone.replace(/\D/g, '');
                            window.open(`https://wa.me/55${clean}`, '_blank');
                          }}
                          className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-bold transition-all"
                          title="Abrir WhatsApp da Cliente"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedClientProfile(clientGroup)}
                        className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-black text-xs font-extrabold hover:brightness-110 shadow transition-all"
                      >
                        Ver Perfil
                      </button>
                      {onDeleteClientGroup && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir o perfil e histórico de "${clientGroup.clientName}"?`)) {
                              onDeleteClientGroup(clientGroup.clientName);
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold transition-all"
                          title="Excluir Perfil da Cliente"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description / Quem é ela */}
                  {clientGroup.clientDescription && (
                    <div className="bg-[#1A1A1A] p-2.5 rounded-xl border border-amber-500/30 text-xs text-slate-200">
                      <span className="font-bold text-amber-400 text-[11px] block mb-0.5">
                        👤 Quem é ela / Descrição do Perfil:
                      </span>
                      "{clientGroup.clientDescription}"
                    </div>
                  )}

                  {/* Media Thumbnails for Saved Client */}
                  {(() => {
                    const inspiration = clientGroup.items.find((i) => i.inspirationImageUrl)?.inspirationImageUrl || 
                      bookings.find((b) => b.clientName.trim().toLowerCase() === clientGroup.clientName.trim().toLowerCase() && (b.inspirationImageUrl || b.referenceImageUrl))?.inspirationImageUrl ||
                      bookings.find((b) => b.clientName.trim().toLowerCase() === clientGroup.clientName.trim().toLowerCase() && (b.inspirationImageUrl || b.referenceImageUrl))?.referenceImageUrl;
                    const currentHair = clientGroup.items.find((i) => i.currentHairImageUrl)?.currentHairImageUrl ||
                      bookings.find((b) => b.clientName.trim().toLowerCase() === clientGroup.clientName.trim().toLowerCase() && b.currentHairImageUrl)?.currentHairImageUrl;

                    if (!inspiration && !currentHair) return null;

                    return (
                      <div className="bg-[#141414] p-2.5 rounded-xl border border-[#222] space-y-1.5">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                          📸 Mídias Anexadas no Histórico do Perfil:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {inspiration && inspiration.trim() !== '' && (
                            <div className="flex flex-col items-center gap-1 bg-[#1A1A1A] p-1.5 rounded-lg border border-amber-500/30">
                              <span className="text-[9px] font-extrabold text-amber-300">
                                [Inspiração]
                              </span>
                              <img
                                src={inspiration}
                                alt="Inspiração"
                                className="w-full h-20 rounded-md object-cover border border-[#D4AF37]/30 cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(inspiration, '_blank')}
                              />
                            </div>
                          )}
                          {currentHair && currentHair.trim() !== '' && (
                            <div className="flex flex-col items-center gap-1 bg-[#1A1A1A] p-1.5 rounded-lg border border-emerald-500/30">
                              <span className="text-[9px] font-extrabold text-emerald-300">
                                [Cabelo Atual]
                              </span>
                              <img
                                src={currentHair}
                                alt="Cabelo Atual"
                                className="w-full h-20 rounded-md object-cover border border-emerald-500/30 cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(currentHair, '_blank')}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Service History Summary */}
                  {clientGroup.items.length > 0 && (
                    <div className="pt-2 border-t border-[#2A2A2A] text-xs text-slate-300 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Atendimentos Anteriores ({clientGroup.items.length}):
                      </span>
                      {clientGroup.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-[11px] bg-[#141414] px-2.5 py-1.5 rounded-lg border border-[#222]">
                          <span className="font-semibold text-slate-200">{item.serviceName} ({item.serviceDate})</span>
                          <span className="text-amber-400 font-bold">{item.amountPaid}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GERENCIAMENTO DE DISPONIBILIDADE E BLOQUEIOS */}
      {adminTab === 'blocking' && (
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] border border-[#D4AF37]/40 p-3.5 rounded-2xl text-xs text-amber-200">
            <p className="font-bold flex items-center gap-1.5 mb-1 text-[#D4AF37]">
              <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
              Bloqueios & Controle Semanal de Vagas
            </p>
            Altere horários livres ou bloqueados. Ao bloquear um período, o aplicativo da cliente atualizará o semáforo de disponibilidade e impedirá novas tentativas de agendamento por cima.
          </div>

          {/* Date Pagination Controls in Admin */}
          <DatePaginationControls
            days={days}
            selectedYearMonth={selectedYearMonth}
            selectedPage={selectedPage}
            onSelectYearMonth={setSelectedYearMonth}
            onSelectPage={setSelectedPage}
          />

          <div className="flex items-center justify-between px-1 text-xs font-bold text-amber-300">
            <span>
              Exibindo no Painel: {selectedPage === 1 ? 'Página 1 (Dias 01 a 15)' : 'Página 2 (Dias 16 ao Fim do Mês)'}
            </span>
            <span className="text-gray-400 font-normal text-[11px]">
              {filteredDaysForAdmin.length} dias
            </span>
          </div>

          <div className="space-y-3">
            {filteredDaysForAdmin.length === 0 ? (
              <div className="p-8 text-center bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] text-gray-400 text-xs">
                Nenhum dia cadastrado nesta página do mês.
              </div>
            ) : (
              filteredDaysForAdmin.map((day) => {
                const isBlockedAll = day.isBlocked || (!day.periods.manha && !day.periods.tarde && !day.periods.noite);

                return (
                  <div
                    key={day.id}
                    className="dark-card-bg rounded-2xl border border-[#2A2A2A] p-4 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">{day.dayOfWeek} ({day.dayNumber})</h4>
                        <p className="text-xs text-gray-400">{day.statusLabel}</p>
                      </div>

                      {/* Toggle whole day block */}
                      <button
                        onClick={() => onToggleDayBlock(day.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all ${
                          isBlockedAll
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {isBlockedAll ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-rose-400" />
                            <span>Bloqueado</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Dia Livre</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Period Toggles & Extra Slot Actions */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#2A2A2A]">
                      {(['manha', 'tarde', 'noite'] as Period[]).map((period) => {
                        const isFree = day.periods[period];
                        const isExtra = !!day.extraSlots?.[period];

                        return (
                          <div key={period} className="flex flex-col gap-1.5">
                            <button
                              onClick={() => onTogglePeriodBlock(day.id, period)}
                              className={`w-full py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 border transition-all ${
                                isFree
                                  ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300 hover:bg-emerald-900/70'
                                  : isExtra
                                  ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                                  : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-500 line-through'
                              }`}
                            >
                              <span className="capitalize">{period}</span>
                              <span className="text-[10px] opacity-80 font-normal">
                                {isFree ? 'Disponível' : isExtra ? 'Encaixe ⚡' : 'Ocupado/Bloq.'}
                              </span>
                            </button>

                            {onToggleExtraSlot && (
                              <button
                                onClick={() => onToggleExtraSlot(day.id, period)}
                                className={`w-full py-1 px-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border transition-all ${
                                  isExtra
                                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                                    : 'bg-amber-950/60 hover:bg-amber-900 border-amber-800 text-amber-300'
                                }`}
                                title="Libera vaga extra (status amarelo) no aplicativo"
                              >
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                <span>{isExtra ? 'Encaixe Aberto ⚡' : '+ Vaga Extra'}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GERENCIAMENTO DE PORTFÓLIO & MÍDIAS */}
      {adminTab === 'portfolio' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel text-base font-bold text-slate-200 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
              Gerenciar Mídias e Portfólio ({portfolio.length})
            </h3>

            <button
              onClick={() => {
                setEditingPortfolioItem(null);
                setShowPortfolioModal(true);
              }}
              className="py-2 px-3 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs flex items-center gap-1 shadow hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4 text-black stroke-[3]" />
              <span>Adicionar Foto/Vídeo</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {portfolio.map((item) => (
              <div
                key={item.id}
                className="dark-card-bg rounded-2xl border border-[#2A2A2A] overflow-hidden shadow-md group relative"
              >
                <div className="relative w-full h-32 bg-[#1A1A1A]">
                  {item.mediaType === 'video' || (item.videoUrl && item.videoUrl.trim() !== '') ? (
                    <video src={item.videoUrl || undefined} poster={item.imageUrl || undefined} className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.imageUrl || undefined} alt={item.title} className="w-full h-full object-cover" />
                  )}

                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingPortfolioItem(item);
                        setShowPortfolioModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-black/80 text-amber-300 hover:text-white border border-amber-500/40 shadow transition-all active:scale-95"
                      title="Editar este Trabalho"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePortfolioItem(item.id)}
                      className="p-1.5 rounded-lg bg-black/80 text-rose-400 hover:text-white border border-rose-500/40 shadow transition-all active:scale-95"
                      title="Remover do Portfólio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="absolute bottom-2 left-2 text-[9px] font-bold uppercase bg-black/80 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                    {item.category}
                  </span>
                </div>

                <div className="p-2.5">
                  <h4 className="font-bold text-xs text-slate-200 truncate">{item.title}</h4>
                  <span className="text-[11px] text-[#D4AF37] font-semibold block">{item.estimatedPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONFIGURAÇÕES DA CONTA E PERFIL */}
      {adminTab === 'settings' && (
        <form onSubmit={handleSaveSettingsSubmit} className="dark-card-bg rounded-3xl border border-[#2A2A2A] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
            <h3 className="font-cinzel text-base font-bold text-slate-200 flex items-center gap-2">
              <User className="w-4 h-4 text-[#D4AF37]" />
              Configurações do Perfil do Adson
            </h3>
            {settingsSuccessMsg && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-fadeIn">
                <Check className="w-4 h-4" /> Atualizado!
              </span>
            )}
          </div>

          {/* Foto de Perfil do Adson */}
          <div className="bg-[#121212] p-4 rounded-2xl border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative w-20 h-20 rounded-full bg-[#1A1A1A] border-2 border-[#D4AF37] p-1 shadow-[0_0_15px_rgba(212,175,55,0.3)] shrink-0 group">
              <img
                src={accAvatarUrl || INITIAL_PROFILE_INFO.avatarUrl}
                alt="Foto de Perfil do Adson"
                className="w-full h-full object-cover rounded-full"
              />
              <label
                htmlFor="admin-avatar-file-input"
                className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[#D4AF37]"
                title="Clique para alterar a foto"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[9px] font-extrabold uppercase mt-0.5">Trocar</span>
              </label>
            </div>

            <div className="flex-1 space-y-2 w-full">
              <label className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Foto de Perfil do Adson (Salão Reis)
              </label>

              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <label
                  htmlFor="admin-avatar-file-input"
                  className="px-3 py-1.5 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all active:scale-95 shadow"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Escolher da Galeria</span>
                </label>
                <input
                  id="admin-avatar-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />

                {accAvatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAccAvatarUrl('')}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-all"
                  >
                    Restaurar Padrão
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Ou cole o link/URL da imagem (ex: https://...)"
                value={accAvatarUrl}
                onChange={(e) => setAccAvatarUrl(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:border-[#D4AF37] outline-none placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Nome Profissional</label>
            <input
              type="text"
              value={accName}
              onChange={(e) => setAccName(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Título Profissional</label>
            <input
              type="text"
              value={accTitle}
              onChange={(e) => setAccTitle(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Biografia Curta e Experiência</label>
            <textarea
              value={accBio}
              onChange={(e) => setAccBio(e.target.value)}
              rows={4}
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Telefone de Contato</label>
              <input
                type="text"
                value={accPhone}
                onChange={(e) => setAccPhone(e.target.value)}
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Instagram (@usuario)</label>
              <input
                type="text"
                value={accInstagram}
                onChange={(e) => setAccInstagram(e.target.value)}
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Endereço Físico do Salão</label>
            <input
              type="text"
              value={accAddress}
              onChange={(e) => setAccAddress(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Horário de Funcionamento</label>
            <input
              type="text"
              value={accHours}
              onChange={(e) => setAccHours(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-black" />
            <span>Salvar Dados do Perfil</span>
          </button>
        </form>
      )}

      {/* MODAL 1: Confirm Exact Time Modal */}
      {confirmModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121212] border border-[#D4AF37]/50 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
              <h3 className="font-cinzel font-bold text-base text-[#D4AF37]">Confirmar Horário Exato</h3>
              <button onClick={() => setConfirmModalBooking(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <p className="text-slate-300">
                Digite o horário exato alinhado com a cliente <strong className="text-[#D4AF37]">{confirmModalBooking.clientName}</strong>:
              </p>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">Horário Combinado:</label>
                <input
                  type="text"
                  placeholder="Ex: 15:30h"
                  value={exactTimeInput}
                  onChange={(e) => setExactTimeInput(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-slate-100 font-bold focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveConfirmation}
              className="w-full py-3 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs shadow-lg hover:brightness-110 transition-all"
            >
              Confirmar & Atualizar Vaga no App
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Salvar Cliente no App Modal */}
      {saveClientModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#121212] border border-[#D4AF37]/50 rounded-3xl p-5 max-w-md w-full shadow-2xl text-slate-100 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
              <h3 className="font-cinzel font-bold text-base text-[#D4AF37] flex items-center gap-2">
                <User className="w-4 h-4 text-[#D4AF37]" />
                Salvar Cliente no App
              </h3>
              <button onClick={() => setSaveClientModalBooking(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Confirme os dados da cliente para registrar no perfil do aplicativo:
            </p>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Nome da Cliente</label>
              <input
                type="text"
                value={saveClientName}
                onChange={(e) => setSaveClientName(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                Telefone Definitivo da Cliente (Adson pode alterar)
              </label>
              <input
                type="text"
                value={saveClientPhone}
                onChange={(e) => setSaveClientPhone(e.target.value)}
                placeholder="Ex: 11 99999-8888"
                className="w-full bg-[#1A1A1A] border border-amber-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                Quem é você / Descrição Enviada pela Cliente
              </label>
              <textarea
                rows={3}
                value={saveClientDesc}
                onChange={(e) => setSaveClientDesc(e.target.value)}
                placeholder="Conte um pouco sobre ela ou o histórico do cabelo..."
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-slate-100 focus:border-[#D4AF37] outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Serviço / Atendimento Solicitado</label>
              <input
                type="text"
                value={saveClientService}
                onChange={(e) => setSaveClientService(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
              />
            </div>

            {/* Preview of Attached Photos if available */}
            {(saveClientModalBooking.inspirationImageUrl || saveClientModalBooking.referenceImageUrl || saveClientModalBooking.currentHairImageUrl) && (
              <div className="bg-[#1A1A1A] p-2.5 rounded-xl border border-amber-500/30 space-y-1.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  📸 Mídias a serem vinculadas ao perfil:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Boolean(saveClientModalBooking.inspirationImageUrl || saveClientModalBooking.referenceImageUrl) && (
                    <div className="bg-[#121212] p-1.5 rounded-lg border border-amber-500/40 text-center">
                      <span className="text-[9px] font-extrabold text-amber-300 block mb-1">[Inspiração]</span>
                      <img
                        src={(saveClientModalBooking.inspirationImageUrl || saveClientModalBooking.referenceImageUrl) || undefined}
                        alt="Inspiração"
                        className="w-full h-16 object-cover rounded border border-[#D4AF37]/30"
                      />
                    </div>
                  )}
                  {Boolean(saveClientModalBooking.currentHairImageUrl) && (
                    <div className="bg-[#121212] p-1.5 rounded-lg border border-emerald-500/40 text-center">
                      <span className="text-[9px] font-extrabold text-emerald-300 block mb-1">[Cabelo Atual]</span>
                      <img
                        src={saveClientModalBooking.currentHairImageUrl || undefined}
                        alt="Cabelo Atual"
                        className="w-full h-16 object-cover rounded border border-emerald-500/30"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                onAddClientHistory({
                  clientName: saveClientName.trim() || 'Cliente',
                  clientPhone: saveClientPhone.trim() || 'Sem número',
                  clientDescription: saveClientDesc.trim(),
                  inspirationImageUrl: saveClientModalBooking.inspirationImageUrl || saveClientModalBooking.referenceImageUrl,
                  currentHairImageUrl: saveClientModalBooking.currentHairImageUrl,
                  serviceDate: saveClientModalBooking.dayFormatted,
                  serviceName: saveClientService.trim() || 'Agendamento Salão Reis',
                  notes: saveClientDesc.trim() || 'Cadastrada via aplicativo pelo Adson.',
                  amountPaid: 'R$ 0,00',
                });
                setSaveClientModalBooking(null);
                alert(`Cliente "${saveClientName}" salva com sucesso na aba Clientes Salvos!`);
              }}
              className="w-full py-3 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all mt-2"
            >
              💾 Confirmar & Salvar no Banco de Clientes
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Full Profile Detail View Modal for Selected Client */}
      {selectedClientProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#121212] border border-[#D4AF37]/50 rounded-3xl p-5 max-w-lg w-full shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 font-bold text-base shrink-0">
                  {selectedClientProfile.clientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-cinzel font-bold text-lg text-[#D4AF37]">
                    {selectedClientProfile.clientName}
                  </h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-400" />
                    {selectedClientProfile.clientPhone || 'Sem número cadastrado'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedClientProfile(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Perfil Detail: Description */}
            <div className="bg-[#1A1A1A] p-3.5 rounded-2xl border border-amber-500/40 space-y-1">
              <span className="text-xs font-bold text-amber-400 block">
                👤 Quem é ela / Descrição do Perfil:
              </span>
              <p className="text-xs text-slate-200">
                {selectedClientProfile.clientDescription || 'Nenhuma descrição detalhada informada.'}
              </p>
            </div>

            {/* Perfil Detail: Photos */}
            {(() => {
              const inspiration = selectedClientProfile.items.find((i) => i.inspirationImageUrl)?.inspirationImageUrl ||
                bookings.find((b) => b.clientName.trim().toLowerCase() === selectedClientProfile.clientName.trim().toLowerCase() && (b.inspirationImageUrl || b.referenceImageUrl))?.inspirationImageUrl ||
                bookings.find((b) => b.clientName.trim().toLowerCase() === selectedClientProfile.clientName.trim().toLowerCase() && (b.inspirationImageUrl || b.referenceImageUrl))?.referenceImageUrl;
              const currentHair = selectedClientProfile.items.find((i) => i.currentHairImageUrl)?.currentHairImageUrl ||
                bookings.find((b) => b.clientName.trim().toLowerCase() === selectedClientProfile.clientName.trim().toLowerCase() && b.currentHairImageUrl)?.currentHairImageUrl;

              if (!inspiration && !currentHair) return null;

              return (
                <div className="bg-[#1A1A1A] p-3 rounded-2xl border border-amber-500/40 space-y-2">
                  <span className="text-xs font-bold text-amber-400 block">
                    📸 Mídias Anexadas da Cliente:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {inspiration && inspiration.trim() !== '' && (
                      <div className="bg-[#121212] p-2 rounded-xl border border-amber-500/30 text-center space-y-1">
                        <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block">
                          [Inspiração]
                        </span>
                        <img
                          src={inspiration}
                          alt="Inspiração"
                          className="w-full h-28 rounded-lg object-cover border border-[#D4AF37]/40 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(inspiration, '_blank')}
                        />
                      </div>
                    )}
                    {currentHair && currentHair.trim() !== '' && (
                      <div className="bg-[#121212] p-2 rounded-xl border border-emerald-500/30 text-center space-y-1">
                        <span className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider block">
                          [Cabelo Atual]
                        </span>
                        <img
                          src={currentHair}
                          alt="Cabelo Atual"
                          className="w-full h-28 rounded-lg object-cover border border-emerald-500/40 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(currentHair, '_blank')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Histórico completo de Atendimentos */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Histórico Completo de Serviços ({selectedClientProfile.items.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedClientProfile.items.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nenhum atendimento anterior registrado ainda.</p>
                ) : (
                  selectedClientProfile.items.map((item) => (
                    <div key={item.id} className="bg-[#181818] p-3 rounded-xl border border-[#2A2A2A] space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-[#D4AF37]">{item.serviceName}</span>
                        <span className="text-emerald-400">{item.amountPaid}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>Data: {item.serviceDate}</span>
                      </div>
                      {item.notes && (
                        <p className="text-[11px] text-slate-300 pt-1 border-t border-[#262626]">
                          <strong>Notas:</strong> {item.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick WhatsApp Link & Add History */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {selectedClientProfile.clientPhone && (
                <button
                  onClick={() => {
                    const clean = selectedClientProfile.clientPhone.replace(/\D/g, '');
                    window.open(`https://wa.me/55${clean}`, '_blank');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Abrir WhatsApp</span>
                </button>
              )}
              <button
                onClick={() => {
                  setHistClientName(selectedClientProfile.clientName);
                  setHistClientPhone(selectedClientProfile.clientPhone);
                  setHistNotes(selectedClientProfile.clientDescription || '');
                  setSelectedClientProfile(null);
                  setShowHistoryModal(true);
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-950/90 border border-amber-600 hover:bg-amber-900 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>+ Atendimento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add or Edit Portfolio Item */}
      <PortfolioModal
        isOpen={showPortfolioModal}
        onClose={() => {
          setShowPortfolioModal(false);
          setEditingPortfolioItem(null);
        }}
        initialItem={editingPortfolioItem}
        categoriesList={categoriesList}
        onAddNewCategoryToList={(newCat) => {
          if (!categoriesList.includes(newCat)) {
            setCategoriesList((prev) => [...prev, newCat]);
          }
        }}
        onSave={(itemData, id) => {
          if (id && onUpdatePortfolioItem) {
            onUpdatePortfolioItem({
              ...itemData,
              id,
            });
          } else {
            onAddPortfolioItem(itemData);
          }
        }}
      />
    </div>
  );
};
