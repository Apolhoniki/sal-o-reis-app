import React, { useState } from 'react';
import { MessageCircle, Calendar, Sparkles, Clock, Tag, PlusCircle, Video, Pencil } from 'lucide-react';
import { PortfolioItem } from '../types';
import { ADSON_WHATSAPP_NUMBER, ADSON_NAME } from '../data/mockData';
import { PortfolioModal } from './PortfolioModal';

interface PortfolioFeedProps {
  portfolio: PortfolioItem[];
  whatsappNumber?: string;
  onSelectPhotoForBooking: (photoUrl: string) => void;
  onGoToAgendar: () => void;
  isAdmin?: boolean;
  onOpenAddPortfolioModal?: () => void;
  onUpdatePortfolioItem?: (item: PortfolioItem) => void;
}

export const PortfolioFeed: React.FC<PortfolioFeedProps> = ({
  portfolio,
  whatsappNumber,
  onSelectPhotoForBooking,
  onGoToAgendar,
  isAdmin,
  onOpenAddPortfolioModal,
  onUpdatePortfolioItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const baseCategories = [
    'Todos',
    'Morena Iluminada',
    'Mechas & Coloração',
    'Cortes Femininos',
    'Tratamento & Escova',
    'Penteados & Eventos',
  ];

  // Extract all categories including custom ones added by admin
  const categories = Array.from(
    new Set([
      ...baseCategories,
      ...portfolio.map((item) => item.category).filter(Boolean),
    ])
  );

  const filteredPortfolio =
    selectedCategory === 'Todos'
      ? portfolio
      : portfolio.filter((item) => item.category === selectedCategory);

  const handleServiceQuestionWhatsApp = (title: string) => {
    const message = `Oi, Adson! Gostei bastante dessa referência de [${title}] do seu portfólio no aplicativo do Salão Reis. Gostaria de tirar algumas dúvidas sobre este serviço e saber se fica bem para o meu cabelo!`;
    const targetNumber = whatsappNumber || ADSON_WHATSAPP_NUMBER;
    const cleanNumber = targetNumber.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="pb-28">
      {/* Portfolio Title & Subtitle Banner */}
      <div className="text-center pt-2 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Feed de Inspirações Salão Reis</span>
        </div>
        <h2 className="font-cinzel text-xl font-bold gold-text-gradient">
          Transformações & Portfólio
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Inspire-se nas fotos reais de trabalhos realizados pelo Adson e escolha sua referência preferida.
        </p>
      </div>

      {/* Admin Add Item Quick Action */}
      {isAdmin && onOpenAddPortfolioModal && (
        <div className="mb-4 text-center">
          <button
            onClick={onOpenAddPortfolioModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gold-bg-gradient text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Adicionar Foto/Vídeo ao Portfólio</span>
          </button>
        </div>
      )}

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'gold-bg-gradient text-slate-950 shadow-md font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vertical Feed / Cards List */}
      <div className="mt-4 space-y-6">
        {filteredPortfolio.map((item) => (
          <article
            key={item.id}
            className="dark-card-bg rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl transition-all hover:border-[#d4af37]/40 group"
          >
            {/* Image or Video Box */}
            <div className="relative w-full aspect-[4/3] bg-slate-900 overflow-hidden">
              {item.mediaType === 'video' || item.videoUrl ? (
                <video
                  src={item.videoUrl}
                  poster={item.imageUrl}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              )}
              
              {item.mediaType !== 'video' && (
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-transparent to-transparent opacity-80 pointer-events-none" />
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none z-10">
                <span className="bg-slate-900/90 backdrop-blur-md text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {item.category}
                </span>
                {(item.mediaType === 'video' || item.videoUrl) && (
                  <span className="bg-purple-950/90 text-purple-300 border border-purple-500/50 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Video className="w-3 h-3 text-purple-400" />
                    <span>Vídeo</span>
                  </span>
                )}
                {item.isPopular && (
                  <span className="gold-bg-gradient text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md uppercase">
                    Mais Pedido
                  </span>
                )}
              </div>

              {/* Price / Duration floating badge */}
              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/80 text-xs font-semibold text-slate-200 pointer-events-none z-10">
                {item.estimatedPrice}
              </div>

              {/* Admin Edit Small Button */}
              {isAdmin && (
                <button
                  onClick={() => setEditingItem(item)}
                  className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-lg border border-amber-300 flex items-center gap-1 z-20 active:scale-95 transition-all"
                  title="Editar este trabalho do portfólio"
                >
                  <Pencil className="w-3 h-3 stroke-[2.5]" />
                  <span>Editar</span>
                </button>
              )}
            </div>

            {/* Content Body */}
            <div className="p-5">
              <h3 className="font-cinzel font-bold text-lg text-slate-100 gold-text-gradient mb-1.5">
                {item.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {item.description}
              </p>

              {/* Characteristic / Highlight Tags Badges */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {item.tags.map((tag) => {
                    let icon = '🏷️';
                    if (tag === 'Mais Pedido') icon = '⭐';
                    else if (tag === 'Mais Rápido') icon = '⚡';
                    else if (tag === 'Menos Agressivo') icon = '🍃';
                    else if (tag === 'Com Botox') icon = '🧪';
                    else if (tag === 'Com Química') icon = '💈';
                    else if (tag === 'Sem Química') icon = '🌱';
                    else if (tag === 'Permanente') icon = '♾️';
                    else if (tag === 'Pouco Tempo') icon = '⏱️';

                    return (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold flex items-center gap-1 shadow-sm"
                      >
                        <span>{icon}</span>
                        <span>{tag}</span>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-4 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Duração aprox: {item.durationMinutes} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Salão Reis</span>
                </div>
              </div>

              {/* Buttons Row */}
              <div className="flex flex-col gap-2 pt-1">
                {/* Discrete Question Button */}
                <button
                  onClick={() => handleServiceQuestionWhatsApp(item.title)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-amber-400" />
                  <span>Dúvida sobre este serviço? Fale com o Adson</span>
                </button>

                {/* Select Photo as Reference for Booking */}
                <button
                  onClick={() => {
                    onSelectPhotoForBooking(item.imageUrl);
                    onGoToAgendar();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl gold-bg-gradient text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Quero Agendar com esta Referência</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Fixed Footer Floating Button for Agendar */}
      <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            onClick={onGoToAgendar}
            className="w-full py-3.5 px-6 rounded-2xl gold-bg-gradient text-slate-950 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(212,175,55,0.4)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Calendar className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            <span>Quero Agendar um Horário</span>
          </button>
        </div>
      </div>

      {/* Portfolio Edit Modal for Admin */}
      {editingItem && (
        <PortfolioModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          initialItem={editingItem}
          categoriesList={categories}
          onSave={(updatedData, id) => {
            if (id && onUpdatePortfolioItem) {
              onUpdatePortfolioItem({
                ...updatedData,
                id,
              });
            }
          }}
        />
      )}
    </div>
  );
};
