import React from 'react';
import { Palette, X, Check, Sparkles, Smartphone, Monitor, Crown, Moon, Sun, Gem, ShieldAlert } from 'lucide-react';
import { ThemeMode } from '../types';

interface DesignOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  isSmartphoneFrame: boolean;
  onToggleFrame: () => void;
}

interface ThemeOption {
  id: ThemeMode;
  name: string;
  subtitle: string;
  badge: string;
  bgGradient: string;
  cardColor: string;
  accentColor: string;
  textColor: string;
  borderColor: string;
  description: string;
  icon: React.ReactNode;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'preto-luxo',
    name: 'Ouro Negro (Preto Luxo)',
    subtitle: 'Tema Oficial Padrão',
    badge: 'Mais Utilizado',
    bgGradient: 'from-[#0A0A0A] to-[#141414]',
    cardColor: '#121212',
    accentColor: '#D4AF37',
    textColor: '#FFFFFF',
    borderColor: '#D4AF37',
    description: 'Fundo preto profundo com contrastes reluzentes em Ouro 24k. Atemporal e extremamente elegante.',
    icon: <Moon className="w-5 h-5 text-[#D4AF37]" />,
  },
  {
    id: 'branco-luxo',
    name: 'Branco Pérola (White Luxury)',
    subtitle: 'Edição Iluminada',
    badge: 'Alta Visibilidade',
    bgGradient: 'from-[#FAF8F5] to-[#FFFFFF]',
    cardColor: '#FFFFFF',
    accentColor: '#D4AF37',
    textColor: '#2D2419',
    borderColor: '#D4AF37',
    description: 'Fundo marfim limpo com molduras douradas e tipografia escura para leitura nítida sob luz do sol.',
    icon: <Sun className="w-5 h-5 text-amber-500" />,
  },
  {
    id: 'ametista-real',
    name: 'Ametista Real (Roxo & Ouro)',
    subtitle: 'Cores da Logo Oficial',
    badge: 'Exclusivo da Marca',
    bgGradient: 'from-[#0F0717] to-[#200E33]',
    cardColor: '#180D26',
    accentColor: '#F5E08B',
    textColor: '#F3E8FF',
    borderColor: '#D4AF37',
    description: 'Tom roxo aveludado profundo inspirado diretamente na nova logo do Salão Reis com coroa dourada.',
    icon: <Crown className="w-5 h-5 text-purple-300" />,
  },
  {
    id: 'esmeralda-imperial',
    name: 'Esmeralda Imperial',
    subtitle: 'Verde Botânico & Ouro',
    badge: 'Nobreza & Bem-Estar',
    bgGradient: 'from-[#041410] to-[#0A261E]',
    cardColor: '#0B211B',
    accentColor: '#34D399',
    textColor: '#ECFDF5',
    borderColor: '#D4AF37',
    description: 'Tom verde esmeralda fechado que remete a tranquilidade, cuidados capilares e regeneração.',
    icon: <Gem className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: 'safira-midnight',
    name: 'Safira Midnight',
    subtitle: 'Azul Noturno Executivo',
    badge: 'Moderno & Refinado',
    bgGradient: 'from-[#070D1A] to-[#12203B]',
    cardColor: '#0E182B',
    accentColor: '#60A5FA',
    textColor: '#EFF6FF',
    borderColor: '#D4AF37',
    description: 'Azul marinho noturno luxuoso com toques de ouro champanhe para uma estética contemporânea.',
    icon: <Sparkles className="w-5 h-5 text-blue-400" />,
  },
];

export const DesignOptionsModal: React.FC<DesignOptionsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  isSmartphoneFrame,
  onToggleFrame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121212] border border-[#D4AF37]/60 rounded-2xl shadow-[0_0_35px_rgba(212,175,55,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1A1A1A] border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA771C] flex items-center justify-center text-black font-bold shadow-md">
              <Palette className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-[#D4AF37] tracking-wider uppercase leading-none">
                Opções de Design
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Personalize a identidade e paleta de cores do Salão Reis
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 custom-scrollbar">
          
          {/* Section: Themes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Paletas de Cores Nobres ({THEME_OPTIONS.length} Opções)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = currentTheme === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => onSelectTheme(theme.id)}
                    className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-[#1C1C1C] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] ring-1 ring-[#D4AF37]'
                        : 'bg-[#161616] border-[#2A2A2A] hover:border-[#D4AF37]/50 hover:bg-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md shrink-0 bg-black/40 border border-[#D4AF37]/40">
                          {theme.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-gray-100 group-hover:text-[#D4AF37] transition-colors">
                              {theme.name}
                            </h4>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold tracking-wider uppercase border border-[#D4AF37]/30">
                              {theme.badge}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                            {theme.description}
                          </p>
                        </div>
                      </div>

                      {/* Select Indicator */}
                      <div className="shrink-0 pt-1">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black flex items-center justify-center font-bold shadow-lg">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-gray-600 group-hover:border-[#D4AF37] transition-colors" />
                        )}
                      </div>
                    </div>

                    {/* Color Preview Swatch Bar */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 font-medium">Amostra:</span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: theme.cardColor }}
                          title="Fundo dos Cards"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: theme.accentColor }}
                          title="Cor de Destaque"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                          style={{ backgroundColor: theme.borderColor }}
                          title="Bordas Douradas"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Layout Mode */}
          <div className="pt-3 border-t border-[#2A2A2A]">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5 mb-3">
              <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
              Modo de Visualização do Layout
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (!isSmartphoneFrame) onToggleFrame();
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                  isSmartphoneFrame
                    ? 'bg-[#1C1C1C] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'bg-[#161616] border-[#2A2A2A] text-gray-400 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-xs font-semibold">Moldura Smartphone</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isSmartphoneFrame) onToggleFrame();
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                  !isSmartphoneFrame
                    ? 'bg-[#1C1C1C] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'bg-[#161616] border-[#2A2A2A] text-gray-400 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-xs font-semibold">Modo Tela Cheia</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#1A1A1A] border-t border-[#2A2A2A] flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-black font-bold text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            Aplicar Design
          </button>
        </div>

      </div>
    </div>
  );
};
