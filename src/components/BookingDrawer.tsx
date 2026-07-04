import React, { useState, useEffect } from 'react';
import { X, Sun, Sunset, Moon, Image as ImageIcon, MessageSquare, Check, Sparkles, User, Phone, Upload, Camera } from 'lucide-react';
import { DaySchedule, Period } from '../types';
import { ADSON_WHATSAPP_NUMBER, INITIAL_PORTFOLIO } from '../data/mockData';

interface BookingDrawerProps {
  day: DaySchedule | null;
  isOpen: boolean;
  onClose: () => void;
  preselectedPhoto?: string;
  whatsappNumber?: string;
  onConfirmBooking: (bookingData: {
    clientName: string;
    clientPhone: string;
    clientDescription?: string;
    dateId: string;
    dayFormatted: string;
    period: Period;
    referenceImageUrl?: string;
    inspirationImageUrl?: string;
    currentHairImageUrl?: string;
  }) => void;
}

export const BookingDrawer: React.FC<BookingDrawerProps> = ({
  day,
  isOpen,
  onClose,
  preselectedPhoto,
  whatsappNumber,
  onConfirmBooking,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientDescription, setClientDescription] = useState('');
  const [isReturningClient, setIsReturningClient] = useState(false);
  const [showEditFields, setShowEditFields] = useState(false);
  
  // Field 1: Inspiration / Reference Photo
  const [inspirationPhoto, setInspirationPhoto] = useState<string | undefined>(preselectedPhoto);
  const [showPortfolioPicker, setShowPortfolioPicker] = useState(false);

  // Field 2: Current Hair Photo
  const [currentHairPhoto, setCurrentHairPhoto] = useState<string | undefined>(undefined);

  // Load saved client profile from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('salao_reis_client_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clientName) {
          setClientName(parsed.clientName || '');
          setClientPhone(parsed.clientPhone || '');
          setClientDescription(parsed.clientDescription || '');
          setIsReturningClient(true);
        }
      }
    } catch (e) {
      console.error('Error reading client profile from localStorage:', e);
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedPhoto) {
      setInspirationPhoto(preselectedPhoto);
    }
  }, [preselectedPhoto]);

  useEffect(() => {
    // Reset or auto-select first available period when day changes
    if (day) {
      if (day.periods.tarde || day.extraSlots?.tarde) setSelectedPeriod('tarde');
      else if (day.periods.manha || day.extraSlots?.manha) setSelectedPeriod('manha');
      else if (day.periods.noite || day.extraSlots?.noite) setSelectedPeriod('noite');
      else setSelectedPeriod(null);
    }
  }, [day]);

  if (!isOpen || !day) return null;

  const handleInspirationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInspirationPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCurrentHairUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentHairPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePeriodClick = (p: Period) => {
    if (day.periods[p] || day.extraSlots?.[p]) {
      setSelectedPeriod(p);
    }
  };

  const getPeriodLabel = (p: Period) => {
    switch (p) {
      case 'manha':
        return 'Manhã';
      case 'tarde':
        return 'Tarde';
      case 'noite':
        return 'Noite';
    }
  };

  // Generate WhatsApp dynamic consensus link
  const buildWhatsAppLink = () => {
    const periodName = selectedPeriod ? getPeriodLabel(selectedPeriod) : 'Tarde';
    const dayName = `${day.dayOfWeek}`;
    const nameText = clientName.trim() ? `Meu nome é ${clientName.trim()}. ` : '';
    const descText = clientDescription.trim() ? ` (Sobre mim: "${clientDescription.trim()}")` : '';
    
    let message = '';
    const isEncaixe = selectedPeriod && day.extraSlots?.[selectedPeriod];

    if (isEncaixe) {
      message = `Oi, Adson! ${nameText}${descText}Vi no aplicativo do Salão Reis que você tem um horário de encaixe na [${dayName}] no período da [${periodName}]. Gostaria de agendar esse horário de encaixe com você!`;
    } else {
      message = `Oi, Adson! ${nameText}${descText}Vi no aplicativo do Salão Reis que você tem horários livres na [${dayName} - ${day.dayNumber}] no período da [${periodName}]. Gostaria de combinar um horário para fazer um serviço. Qual momento fica melhor para você?`;
    }
    
    if (inspirationPhoto && currentHairPhoto) {
      message += `\n\n📸 Estou enviando uma foto de referência do que quero e uma foto de como está meu cabelo atualmente!`;
    } else if (inspirationPhoto) {
      message += `\n\n📸 Estou enviando uma foto de referência do estilo que quero alcançar!`;
    } else if (currentHairPhoto) {
      message += `\n\n📸 Estou enviando uma foto de como está meu cabelo atualmente para avaliação técnica!`;
    }

    const encodedText = encodeURIComponent(message);
    const targetNumber = whatsappNumber || ADSON_WHATSAPP_NUMBER;
    const cleanNumber = targetNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodedText}`;
  };

  const handleConsensusSubmit = () => {
    if (!selectedPeriod) return;

    const finalClientName = clientName.trim() || 'Cliente';
    const finalClientPhone = clientPhone.trim() || '11999998888';

    // Save profile to localStorage for returning client memory
    try {
      localStorage.setItem(
        'salao_reis_client_profile',
        JSON.stringify({
          clientName: finalClientName,
          clientPhone: finalClientPhone,
          clientDescription: clientDescription.trim(),
        })
      );
    } catch (e) {
      console.error('Error saving client profile to localStorage:', e);
    }

    // Record request in local app state
    onConfirmBooking({
      clientName: finalClientName,
      clientPhone: finalClientPhone,
      clientDescription: clientDescription.trim(),
      dateId: day.id,
      dayFormatted: `${day.dayOfWeek} - ${day.dayNumber}`,
      period: selectedPeriod,
      referenceImageUrl: inspirationPhoto || currentHairPhoto,
      inspirationImageUrl: inspirationPhoto,
      currentHairImageUrl: currentHairPhoto,
    });

    // Open WhatsApp in new tab
    const waUrl = buildWhatsAppLink();
    window.open(waUrl, '_blank');

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4 transition-all animate-fadeIn">
      <div
        className="w-full max-w-md bg-[#13161f] border-t sm:border border-[#d4af37]/30 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[92vh] text-slate-100 relative"
      >
        {/* Top Handle / Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 green-status-glow" />
            <h2 className="font-cinzel font-bold text-lg text-slate-100 gold-text-gradient">
              {day.dayOfWeek} ({day.dayNumber})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Returning Client Greeting Banner */}
        {isReturningClient && clientName && (
          <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 p-3 rounded-2xl my-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 font-bold text-sm">
                {clientName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-amber-300">
                  Olá, {clientName}!
                </p>
                <p className="text-[11px] text-slate-300">
                  Perfil carregado! Selecione o período do seu agendamento.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowEditFields(!showEditFields)}
              className="text-[11px] text-amber-400 hover:underline font-medium ml-2 whitespace-nowrap"
            >
              {showEditFields ? 'Ocultar' : 'Editar perfil'}
            </button>
          </div>
        )}

        {/* Step 1 Question: Qual período fica melhor? */}
        <div className="my-5">
          <p className="text-sm font-semibold text-slate-300 mb-3.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Qual período fica melhor para você?
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Manhã Button */}
            {(() => {
              const isFree = day.periods.manha || !!day.extraSlots?.manha;
              const isExtra = !!day.extraSlots?.manha;
              return (
                <button
                  disabled={!isFree}
                  onClick={() => handlePeriodClick('manha')}
                  className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border font-semibold text-xs transition-all duration-200 relative ${
                    !isFree
                      ? 'bg-slate-900/60 border-slate-800/80 text-slate-600 cursor-not-allowed opacity-50 line-through'
                      : selectedPeriod === 'manha'
                      ? isExtra
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.6)] scale-105'
                        : 'gold-bg-gradient text-slate-950 font-bold border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105'
                      : isExtra
                      ? 'bg-amber-950/90 border-amber-500/80 text-amber-300 hover:border-amber-400 yellow-status-glow animate-pulse'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:border-[#d4af37]/40'
                  }`}
                >
                  <Sun className={`w-5 h-5 mb-1 ${selectedPeriod === 'manha' ? 'text-slate-950' : isExtra ? 'text-amber-300' : 'text-amber-400'}`} />
                  <span>Manhã</span>
                  <span className={`text-[10px] font-normal mt-0.5 ${isExtra ? 'text-amber-300 font-extrabold' : 'opacity-75'}`}>
                    {isExtra ? '⚡ ENCAIXE' : '08h - 12h'}
                  </span>
                </button>
              );
            })()}

            {/* Tarde Button */}
            {(() => {
              const isFree = day.periods.tarde || !!day.extraSlots?.tarde;
              const isExtra = !!day.extraSlots?.tarde;
              return (
                <button
                  disabled={!isFree}
                  onClick={() => handlePeriodClick('tarde')}
                  className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border font-semibold text-xs transition-all duration-200 relative ${
                    !isFree
                      ? 'bg-slate-900/60 border-slate-800/80 text-slate-600 cursor-not-allowed opacity-50 line-through'
                      : selectedPeriod === 'tarde'
                      ? isExtra
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.6)] scale-105'
                        : 'gold-bg-gradient text-slate-950 font-bold border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105'
                      : isExtra
                      ? 'bg-amber-950/90 border-amber-500/80 text-amber-300 hover:border-amber-400 yellow-status-glow animate-pulse'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:border-[#d4af37]/40'
                  }`}
                >
                  <Sunset className={`w-5 h-5 mb-1 ${selectedPeriod === 'tarde' ? 'text-slate-950' : isExtra ? 'text-amber-300' : 'text-amber-500'}`} />
                  <span>Tarde</span>
                  <span className={`text-[10px] font-normal mt-0.5 ${isExtra ? 'text-amber-300 font-extrabold' : 'opacity-75'}`}>
                    {isExtra ? '⚡ ENCAIXE' : '13h - 18h'}
                  </span>
                </button>
              );
            })()}

            {/* Noite Button */}
            {(() => {
              const isFree = day.periods.noite || !!day.extraSlots?.noite;
              const isExtra = !!day.extraSlots?.noite;
              return (
                <button
                  disabled={!isFree}
                  onClick={() => handlePeriodClick('noite')}
                  className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl border font-semibold text-xs transition-all duration-200 relative ${
                    !isFree
                      ? 'bg-slate-900/60 border-slate-800/80 text-slate-600 cursor-not-allowed opacity-50 line-through'
                      : selectedPeriod === 'noite'
                      ? isExtra
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.6)] scale-105'
                        : 'gold-bg-gradient text-slate-950 font-bold border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105'
                      : isExtra
                      ? 'bg-amber-950/90 border-amber-500/80 text-amber-300 hover:border-amber-400 yellow-status-glow animate-pulse'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:border-[#d4af37]/40'
                  }`}
                >
                  <Moon className={`w-5 h-5 mb-1 ${selectedPeriod === 'noite' ? 'text-slate-950' : isExtra ? 'text-amber-300' : 'text-indigo-400'}`} />
                  <span>Noite</span>
                  <span className={`text-[10px] font-normal mt-0.5 ${isExtra ? 'text-amber-300 font-extrabold' : 'opacity-75'}`}>
                    {isExtra ? '⚡ ENCAIXE' : '18h - 21h'}
                  </span>
                </button>
              );
            })()}
          </div>
        </div>

        {/* Optional Client Details & Profile Textarea */}
        {(!isReturningClient || showEditFields) && (
          <div className="space-y-3 my-4 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 animate-fadeIn">
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Seus dados para o agendamento:
            </label>

            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Seu nome (ex: Maria Silva)"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="tel"
                placeholder="Seu WhatsApp (ex: 11 99999-8888)"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {/* Quem é você / Descrição Opcional Textarea */}
            <div>
              <label className="text-[11px] font-medium text-amber-300 block mb-1">
                Quem é você / Descrição Opcional:
              </label>
              <textarea
                rows={2}
                placeholder="Conte um pouco sobre você ou seu cabelo, se quiser (Ex: 'Sou a irmã da Maria, quero retocar a progressiva')"
                value={clientDescription}
                onChange={(e) => setClientDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#d4af37] resize-none"
              />
            </div>
          </div>
        )}

        {/* Anexos de Fotos: Dois Campos Independentes */}
        <div className="my-4 space-y-3">
          {/* Campo 1: Foto de Inspiração / Referência (Opcional) */}
          <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>1. Foto de Inspiração / Referência (Opcional)</span>
              </label>
              {inspirationPhoto && (
                <button
                  type="button"
                  onClick={() => setInspirationPhoto(undefined)}
                  className="text-[11px] text-rose-400 font-semibold hover:underline"
                >
                  Remover
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Escolha uma foto do portfólio do app ou envie a imagem do estilo que você deseja alcançar.
            </p>

            {inspirationPhoto ? (
              <div className="relative w-full h-28 rounded-xl overflow-hidden border border-amber-500/50 group bg-black/40">
                <img src={inspirationPhoto} alt="Foto inspiração" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-amber-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow">
                  ✨ Inspiração Escolhida
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-950 border border-slate-800 hover:border-amber-400/50 rounded-xl text-xs text-slate-200 cursor-pointer transition-all font-medium">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Enviar Foto</span>
                    <input type="file" accept="image/*" onChange={handleInspirationUpload} className="hidden" />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowPortfolioPicker(!showPortfolioPicker)}
                    className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-950 border border-slate-800 hover:border-amber-400/50 rounded-xl text-xs text-amber-300 font-medium transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Escolher Portfólio</span>
                  </button>
                </div>

                {/* Portfolio Picker */}
                {showPortfolioPicker && (
                  <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                    {INITIAL_PORTFOLIO.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          setInspirationPhoto(item.imageUrl);
                          setShowPortfolioPicker(false);
                        }}
                        className="relative h-16 rounded-lg overflow-hidden border border-slate-800 hover:border-amber-400 transition-all group"
                      >
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/60 p-1 flex items-end">
                          <span className="text-[9px] font-medium leading-none text-white truncate">
                            {item.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campo 2: Foto do seu Cabelo Atual (Opcional) */}
          <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>2. Foto do seu Cabelo Atual (Opcional)</span>
              </label>
              {currentHairPhoto && (
                <button
                  type="button"
                  onClick={() => setCurrentHairPhoto(undefined)}
                  className="text-[11px] text-rose-400 font-semibold hover:underline"
                >
                  Remover
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Tire uma foto na hora ou anexe uma imagem mostrando como seu cabelo está hoje para ajuda na avaliação técnica do Adson.
            </p>

            {currentHairPhoto ? (
              <div className="relative w-full h-28 rounded-xl overflow-hidden border border-emerald-500/50 group bg-black/40">
                <img src={currentHairPhoto} alt="Cabelo atual" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-emerald-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow">
                  💇‍♀️ Cabelo Atual Anexado
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-950 border border-slate-800 hover:border-emerald-400/50 rounded-xl text-xs text-slate-200 cursor-pointer transition-all font-medium">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tirar Foto Agora</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleCurrentHairUpload} className="hidden" />
                </label>

                <label className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-950 border border-slate-800 hover:border-amber-400/50 rounded-xl text-xs text-slate-200 cursor-pointer transition-all font-medium">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Anexar da Galeria</span>
                  <input type="file" accept="image/*" onChange={handleCurrentHairUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Action Button - O Botão de Consenso */}
        <div className="mt-6 pt-3 border-t border-slate-800">
          <button
            disabled={!selectedPeriod}
            onClick={handleConsensusSubmit}
            className={`w-full py-4 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all duration-300 active:scale-95 ${
              selectedPeriod
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 green-status-glow border border-emerald-300'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <MessageSquare className="w-5 h-5 text-slate-950 fill-slate-950" />
            <span>💬 Combinar Horário no WhatsApp</span>
          </button>

          <p className="text-[11px] text-center text-slate-400 mt-2.5">
            Ao clicar, abriremos o WhatsApp do Adson com a mensagem pré-definida dos seus horários.
          </p>
        </div>
      </div>
    </div>
  );
};
