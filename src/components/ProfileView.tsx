import React, { useState, useEffect } from 'react';
import { Crown, MapPin, Phone, Instagram, Clock, Scissors, Award, Sparkles, Edit3, Save, Plus, X, Trash2, Calendar, Palette, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { ServiceItem, AdsonProfileInfo, ThemeMode } from '../types';
import { SALAO_NAME } from '../data/mockData';

interface ProfileViewProps {
  profileInfo: AdsonProfileInfo;
  services: ServiceItem[];
  isAdmin?: boolean;
  onUpdateProfileInfo?: (updated: AdsonProfileInfo) => void;
  onAddService?: (newSrv: Omit<ServiceItem, 'id'>) => void;
  onDeleteService?: (id: string) => void;
  onSelectServiceToBook?: (serviceName: string) => void;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileInfo,
  services,
  isAdmin = false,
  onUpdateProfileInfo,
  onAddService,
  onDeleteService,
  onSelectServiceToBook,
  themeMode = 'preto-luxo',
  onToggleTheme,
}) => {
  // Bio/Info Editing Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editBio, setEditBio] = useState(profileInfo.bio);
  const [editTitle, setEditTitle] = useState(profileInfo.title);
  const [editExpYears, setEditExpYears] = useState(profileInfo.experienceYears);
  const [editPhone, setEditPhone] = useState(profileInfo.phone);
  const [editWhatsapp, setEditWhatsapp] = useState(profileInfo.whatsapp);
  const [editAddress, setEditAddress] = useState(profileInfo.address);
  const [editHours, setEditHours] = useState(profileInfo.operatingHours);

  useEffect(() => {
    setEditBio(profileInfo.bio);
    setEditTitle(profileInfo.title);
    setEditExpYears(profileInfo.experienceYears);
    setEditPhone(profileInfo.phone);
    setEditWhatsapp(profileInfo.whatsapp);
    setEditAddress(profileInfo.address);
    setEditHours(profileInfo.operatingHours);
  }, [profileInfo]);

  // Add Service Modal State
  const [isAddingService, setIsAddingService] = useState(false);
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCategory, setNewSrvCategory] = useState('Coloração');
  const [newSrvDuration, setNewSrvDuration] = useState('1h30');
  const [newSrvPrice, setNewSrvPrice] = useState('R$ 200,00');
  const [newSrvDesc, setNewSrvDesc] = useState('');

  const handleOpenWhatsAppGeneral = () => {
    const cleanNumber = profileInfo.whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent('Oi, Adson! Gostaria de tirar uma dúvida geral sobre os serviços do Salão Reis.')}`;
    window.open(url, '_blank');
  };

  const handleOpenInstagram = () => {
    const handle = profileInfo.instagram.replace('@', '');
    window.open(`https://instagram.com/${handle}`, '_blank');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfileInfo) {
      onUpdateProfileInfo({
        ...profileInfo,
        title: editTitle,
        bio: editBio,
        experienceYears: Number(editExpYears),
        phone: editPhone,
        whatsapp: editWhatsapp.trim() || editPhone.trim(),
        address: editAddress,
        operatingHours: editHours,
      });
    }
    setIsEditingProfile(false);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddService && newSrvName.trim()) {
      onAddService({
        name: newSrvName.trim(),
        category: newSrvCategory,
        duration: newSrvDuration,
        price: newSrvPrice,
        description: newSrvDesc || 'Serviço prestado com excelência no Salão Reis.',
        isPopular: false,
      });
      setNewSrvName('');
      setNewSrvDesc('');
      setIsAddingService(false);
    }
  };

  return (
    <div className="pb-28 space-y-6">
      {/* Salão Reis Stylist Card */}
      <div className="dark-card-bg rounded-3xl border border-[#D4AF37]/40 p-5 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37]/10 rounded-full blur-3xl" />

        <div className="w-22 h-22 mx-auto rounded-full bg-[#1A1A1A] border-2 border-[#D4AF37] p-1 shadow-[0_0_20px_rgba(212,175,55,0.4)] relative mb-3">
          <img
            src={profileInfo.avatarUrl}
            alt={profileInfo.name}
            className="w-full h-full object-cover rounded-full"
          />
          <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-black p-1 rounded-full shadow-md">
            <Award className="w-4 h-4 text-black" />
          </div>
        </div>

        <h2 className="font-cinzel font-bold text-xl text-slate-100 gold-text-gradient">
          {SALAO_NAME}
        </h2>
        <p className="text-xs font-semibold text-[#D4AF37] tracking-wider uppercase mt-1">
          {profileInfo.name} • {profileInfo.title}
        </p>
        
        {/* Bio Text */}
        <p className="text-xs text-slate-300 mt-3 max-w-sm mx-auto leading-relaxed bg-[#1A1A1A] p-3 rounded-2xl border border-[#2A2A2A] text-left">
          <strong className="text-[#D4AF37] block mb-1">Sobre mim & Biografia:</strong>
          {profileInfo.bio}
        </p>

        <div className="flex items-center justify-center gap-3 text-xs text-amber-300 mt-3 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{profileInfo.experienceYears} anos de experiência comprovada</span>
        </div>

        {/* Admin Edit Profile Trigger */}
        {isAdmin && (
          <div className="mt-3">
            <button
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-bold hover:bg-[#252525] transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Perfil & Biografia</span>
            </button>
          </div>
        )}

        {/* Contact Badges */}
        <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-[#2A2A2A]">
          <button
            onClick={handleOpenWhatsAppGeneral}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-bold hover:bg-emerald-900 transition-all active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Direct</span>
          </button>

          <button
            onClick={handleOpenInstagram}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-slate-200 text-xs font-bold hover:border-[#D4AF37]/50 transition-all active:scale-95"
          >
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>{profileInfo.instagram}</span>
          </button>
        </div>
      </div>

      {/* Location & Operating Hours */}
      <div className="dark-card-bg rounded-3xl border border-[#2A2A2A] p-5 shadow-lg space-y-3">
        <h3 className="font-cinzel text-sm font-bold text-slate-200 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#D4AF37]" />
          Localização & Funcionamento
        </h3>

        <div className="text-xs text-slate-300 space-y-2 bg-[#1A1A1A] p-3 rounded-2xl border border-[#2A2A2A]">
          <p className="font-medium text-slate-200 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <span>{profileInfo.address}</span>
          </p>

          <p className="text-slate-300 flex items-center gap-2 pt-1.5 border-t border-[#2A2A2A]">
            <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>{profileInfo.operatingHours}</span>
          </p>
        </div>
      </div>

      {/* Theme Selector Section */}
      <div className="dark-card-bg rounded-3xl border border-[#2A2A2A] p-5 shadow-lg space-y-3">
        <h3 className="font-cinzel text-sm font-bold text-slate-200 flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#D4AF37]" />
          Aparência do App (Tema Visual)
        </h3>
        <p className="text-xs text-slate-300">
          Alterne entre os temas visuais luxuosos do Salão Reis. Sua preferência fica salva automaticamente.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Option 1: Preto Luxo */}
          <button
            onClick={() => {
              if (themeMode !== 'preto-luxo' && onToggleTheme) onToggleTheme();
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
              themeMode === 'preto-luxo'
                ? 'bg-[#121212] border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-lg'
                : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#D4AF37]/40 opacity-80'
            }`}
          >
            {themeMode === 'preto-luxo' && (
              <div className="absolute top-2.5 right-2.5 text-[#D4AF37]">
                <CheckCircle2 className="w-4 h-4 fill-[#D4AF37] text-black" />
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-[#0A0A0A] border border-[#D4AF37] flex items-center justify-center">
                <Moon className="w-3.5 h-3.5 text-[#D4AF37]" />
              </div>
              <span className="text-xs font-bold text-slate-100">Preto Luxo</span>
            </div>
            <p className="text-[10px] text-slate-400">Canos escuros, elegância & detalhes dourados</p>
          </button>

          {/* Option 2: Branco Luxo */}
          <button
            onClick={() => {
              if (themeMode !== 'branco-luxo' && onToggleTheme) onToggleTheme();
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
              themeMode === 'branco-luxo'
                ? 'bg-white border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-lg text-slate-900'
                : 'bg-slate-100 border-slate-300 hover:border-[#D4AF37]/40 opacity-80 text-slate-800'
            }`}
          >
            {themeMode === 'branco-luxo' && (
              <div className="absolute top-2.5 right-2.5 text-[#D4AF37]">
                <CheckCircle2 className="w-4 h-4 fill-[#D4AF37] text-black" />
              </div>
            )}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-white border border-[#D4AF37] flex items-center justify-center shadow-sm">
                <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-500/30" />
              </div>
              <span className="text-xs font-bold text-slate-900">Branco Luxo</span>
            </div>
            <p className="text-[10px] text-slate-600">Off-white sofisticado, clean & fácil leitura</p>
          </button>
        </div>
      </div>

      {/* Services Menu Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel text-base font-bold text-slate-200 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#D4AF37]" />
            Menu de Serviços e Valores
          </h3>

          {isAdmin && (
            <button
              onClick={() => setIsAddingService(true)}
              className="py-1.5 px-3 rounded-xl bg-[#D4AF37] text-black font-bold text-xs flex items-center gap-1 shadow hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>Novo Serviço</span>
            </button>
          )}
        </div>

        {/* Services List Cards */}
        <div className="space-y-3">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="dark-card-bg rounded-2xl border border-[#2A2A2A] p-4 shadow-md space-y-2 hover:border-[#D4AF37]/50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-100">{srv.name}</h4>
                    {srv.isPopular && (
                      <span className="text-[9px] font-bold uppercase bg-[#D4AF37] text-black px-2 py-0.5 rounded-full shadow">
                        Destaque
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block mt-0.5">
                    Categoria: {srv.category}
                  </span>
                </div>

                {isAdmin && onDeleteService && (
                  <button
                    onClick={() => onDeleteService(srv.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition-all"
                    title="Excluir serviço"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{srv.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-[#2A2A2A]">
                <div className="flex items-center gap-3 text-xs text-[#D4AF37] font-bold">
                  <span>⏱ {srv.duration}</span>
                  <span>•</span>
                  <span>{srv.price}</span>
                </div>

                {onSelectServiceToBook && (
                  <button
                    onClick={() => onSelectServiceToBook(srv.name)}
                    className="py-1.5 px-3 rounded-xl bg-[#1A1A1A] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold hover:bg-[#D4AF37] hover:text-black transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Este</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: Edit Profile & Bio */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveProfile}
            className="bg-[#121212] border border-[#D4AF37]/50 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-slate-100 space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
              <h3 className="font-cinzel font-bold text-sm text-[#D4AF37]">Editar Biografia & Dados do Adson</h3>
              <button onClick={() => setIsEditingProfile(false)} type="button" className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Título / Especialidade</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Biografia Curta & Experiência</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={4}
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Anos de Experiência</label>
              <input
                type="number"
                value={editExpYears}
                onChange={(e) => setEditExpYears(Number(e.target.value))}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Telefone Principal</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">WhatsApp (com DDD)</label>
                <input
                  type="text"
                  value={editWhatsapp}
                  onChange={(e) => setEditWhatsapp(e.target.value)}
                  placeholder="5592984570443"
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Endereço do Salão</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Horário de Funcionamento</label>
              <input
                type="text"
                value={editHours}
                onChange={(e) => setEditHours(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs uppercase shadow-lg hover:brightness-110 transition-all mt-2"
            >
              Salvar Alterações
            </button>
          </form>
        </div>
      )}

      {/* MODAL 2: Add Service */}
      {isAddingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveService}
            className="bg-[#121212] border border-[#D4AF37]/50 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-slate-100 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
              <h3 className="font-cinzel font-bold text-sm text-[#D4AF37]">Adicionar Novo Serviço</h3>
              <button onClick={() => setIsAddingService(false)} type="button" className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Nome do Serviço (ex: Corte Visagista)"
              value={newSrvName}
              onChange={(e) => setNewSrvName(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Duração (ex: 1h30)"
                value={newSrvDuration}
                onChange={(e) => setNewSrvDuration(e.target.value)}
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
              />

              <input
                type="text"
                placeholder="Preço (ex: R$ 180,00)"
                value={newSrvPrice}
                onChange={(e) => setNewSrvPrice(e.target.value)}
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
              />
            </div>

            <textarea
              placeholder="Descrição do procedimento e cuidados inclusos..."
              value={newSrvDesc}
              onChange={(e) => setNewSrvDesc(e.target.value)}
              rows={3}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs uppercase shadow-lg hover:brightness-110 transition-all"
            >
              Cadastrar Serviço
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
