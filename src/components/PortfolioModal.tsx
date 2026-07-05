import React, { useState, useEffect } from 'react';
import { X, Upload, Camera, Film, Tag, Plus, Save } from 'lucide-react';
import { PortfolioItem } from '../types';
import { formatBRLCurrency } from '../utils/formatters';

export const PRESET_TAGS = [
  { id: 'Mais Pedido', label: 'Mais Pedido', icon: '⭐' },
  { id: 'Mais Rápido', label: 'Mais Rápido', icon: '⚡' },
  { id: 'Menos Agressivo', label: 'Menos Agressivo', icon: '🍃' },
  { id: 'Com Botox', label: 'Com Botox', icon: '🧪' },
  { id: 'Com Química', label: 'Com Química', icon: '💈' },
  { id: 'Sem Química', label: 'Sem Química', icon: '🌱' },
  { id: 'Permanente', label: 'Permanente', icon: '♾️' },
  { id: 'Pouco Tempo', label: 'Pouco Tempo', icon: '⏱️' },
];

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<PortfolioItem, 'id'>, id?: string) => void;
  initialItem?: PortfolioItem | null;
  categoriesList: string[];
  onAddNewCategoryToList?: (newCat: string) => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  categoriesList,
  onAddNewCategoryToList,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(initialItem?.id);

  const [portTitle, setPortTitle] = useState(initialItem?.title || '');
  const [portCategory, setPortCategory] = useState(
    initialItem?.category || (categoriesList[0] || 'Morena Iluminada')
  );
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialItem?.tags && initialItem.tags.length > 0
      ? initialItem.tags
      : initialItem?.isPopular
      ? ['Mais Pedido']
      : ['Mais Pedido']
  );
  const [customTagInput, setCustomTagInput] = useState('');
  const [showCustomTagBox, setShowCustomTagBox] = useState(false);

  const [portMediaType, setPortMediaType] = useState<'image' | 'video'>(
    initialItem?.mediaType || 'image'
  );
  const [portImageUrl, setPortImageUrl] = useState(initialItem?.imageUrl || '');
  const [portVideoUrl, setPortVideoUrl] = useState(initialItem?.videoUrl || '');
  const [portDesc, setPortDesc] = useState(initialItem?.description || '');
  const [portPrice, setPortPrice] = useState(initialItem?.estimatedPrice || 'R$ 380,00');
  const [useUrlInput, setUseUrlInput] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setPortTitle(initialItem.title || '');
      setPortCategory(initialItem.category || 'Morena Iluminada');
      setPortMediaType(initialItem.mediaType || 'image');
      setPortImageUrl(initialItem.imageUrl || '');
      setPortVideoUrl(initialItem.videoUrl || '');
      setPortDesc(initialItem.description || '');
      setPortPrice(initialItem.estimatedPrice || 'R$ 380,00');
      setSelectedTags(
        initialItem.tags && initialItem.tags.length > 0
          ? initialItem.tags
          : initialItem.isPopular
          ? ['Mais Pedido']
          : ['Mais Pedido']
      );
    } else {
      setPortTitle('');
      setPortCategory(categoriesList[0] || 'Morena Iluminada');
      setPortMediaType('image');
      setPortImageUrl('');
      setPortVideoUrl('');
      setPortDesc('');
      setPortPrice('R$ 380,00');
      setSelectedTags(['Mais Pedido']);
    }
  }, [initialItem, categoriesList]);

  const handlePortPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBRLCurrency(e.target.value);
    setPortPrice(formatted);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle.trim()) {
      alert('Por favor, informe o título do trabalho.');
      return;
    }
    if (!portImageUrl.trim()) {
      alert('Por favor, anexe uma foto ou vídeo antes de salvar.');
      return;
    }

    let finalCategory = portCategory;
    if (isAddingCustomCategory && customCategoryInput.trim()) {
      finalCategory = customCategoryInput.trim();
      if (onAddNewCategoryToList) {
        onAddNewCategoryToList(finalCategory);
      }
    }

    const finalTags = [...selectedTags];
    if (customTagInput.trim() && !finalTags.includes(customTagInput.trim())) {
      finalTags.push(customTagInput.trim());
    }

    onSave(
      {
        title: portTitle,
        category: finalCategory,
        mediaType: portMediaType,
        imageUrl: portImageUrl,
        videoUrl: portMediaType === 'video' ? portVideoUrl : undefined,
        description: portDesc,
        durationMinutes: initialItem?.durationMinutes || 180,
        estimatedPrice: portPrice || 'R$ 0,00',
        isPopular: finalTags.includes('Mais Pedido'),
        tags: finalTags,
      },
      initialItem?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <form
        onSubmit={handleSubmit}
        className="bg-[#121212] border border-[#D4AF37]/50 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-slate-100 space-y-3 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
          <h3 className="font-cinzel font-bold text-sm text-[#D4AF37]">
            {isEditing ? 'Editar Trabalho do Portfólio' : 'Adicionar Foto/Vídeo ao Portfólio'}
          </h3>
          <button onClick={onClose} type="button" className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
            Mídia (Foto ou Vídeo do Celular)
          </label>

          {/* Media Picker Card */}
          <div className="bg-[#1A1A1A] border-2 border-dashed border-[#D4AF37]/40 rounded-2xl p-4 text-center hover:border-[#D4AF37] transition-all relative">
            {portImageUrl && portImageUrl.trim() !== '' ? (
              <div className="space-y-2">
                {portMediaType === 'video' ? (
                  <div className="relative rounded-xl overflow-hidden max-h-40 bg-black flex items-center justify-center">
                    <video
                      src={(portVideoUrl && portVideoUrl.trim() !== '' ? portVideoUrl : portImageUrl) || undefined}
                      controls
                      className="max-h-40 w-full object-cover rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden max-h-40 bg-black flex items-center justify-center">
                    <img
                      src={portImageUrl || undefined}
                      alt="Preview"
                      className="max-h-40 w-full object-cover rounded-xl"
                    />
                  </div>
                )}
                <div className="flex items-center justify-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#D4AF37] text-black font-bold text-xs flex items-center gap-1 hover:brightness-110">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Trocar Mídia</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPortImageUrl('');
                      setPortVideoUrl('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-950 text-red-300 border border-red-700/60 font-bold text-xs"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center gap-2 py-3">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Anexar Foto ou Vídeo do Celular</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Toque para escolher da galeria de fotos ou gravar vídeo
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#2A2A2A] text-gray-300 text-[10px] font-semibold flex items-center gap-1">
                    <Camera className="w-3 h-3 text-[#D4AF37]" /> Foto
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#2A2A2A] text-gray-300 text-[10px] font-semibold flex items-center gap-1">
                    <Film className="w-3 h-3 text-[#D4AF37]" /> Vídeo MP4
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Option to toggle URL input */}
          <div className="flex justify-end mt-1.5">
            <button
              type="button"
              onClick={() => setUseUrlInput(!useUrlInput)}
              className="text-[10px] text-amber-400 hover:underline"
            >
              {useUrlInput ? '« Usar upload da galeria' : 'Prefer ir por URL de imagem/vídeo web »'}
            </button>
          </div>

          {useUrlInput && (
            <div className="mt-2 space-y-2">
              <input
                type="url"
                placeholder="URL da Imagem (https://...)"
                value={portImageUrl}
                onChange={(e) => setPortImageUrl(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
              />
              {portMediaType === 'video' && (
                <input
                  type="url"
                  placeholder="URL do Vídeo (https://...mp4)"
                  value={portVideoUrl}
                  onChange={(e) => setPortVideoUrl(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
                />
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
            Nome / Título do Trabalho
          </label>
          <input
            type="text"
            placeholder="Título do Trabalho (ex: Blond Dourado Luxo)"
            value={portTitle}
            onChange={(e) => setPortTitle(e.target.value)}
            required
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
            Categoria do Trabalho
          </label>
          <select
            value={isAddingCustomCategory ? 'NOVA_CATEGORIA' : portCategory}
            onChange={(e) => {
              if (e.target.value === 'NOVA_CATEGORIA') {
                setIsAddingCustomCategory(true);
              } else {
                setIsAddingCustomCategory(false);
                setPortCategory(e.target.value);
              }
            }}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="NOVA_CATEGORIA" className="font-bold text-amber-400 bg-slate-900">
              ➕ Adicionar Nova Categoria Manualmente...
            </option>
          </select>

          {isAddingCustomCategory && (
            <div className="mt-2 space-y-1">
              <input
                type="text"
                placeholder="Digite o nome da nova categoria (ex: Mega Hair)"
                value={customCategoryInput}
                onChange={(e) => setCustomCategoryInput(e.target.value)}
                autoFocus
                required
                className="w-full bg-[#1A1A1A] border border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-slate-100 focus:ring-1 focus:ring-[#D4AF37] outline-none"
              />
              <p className="text-[10px] text-amber-400">
                * Esta categoria será salva e ficará disponível nos filtros do portfólio.
              </p>
            </div>
          )}
        </div>

        {/* Tags / Características Selector */}
        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5 flex items-center gap-1">
            <Tag className="w-3 h-3 text-[#D4AF37]" />
            <span>Características & Destaques (Tags)</span>
          </label>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {PRESET_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.label);
              return (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedTags(selectedTags.filter((t) => t !== tag.label));
                    } else {
                      setSelectedTags([...selectedTags, tag.label]);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95 border ${
                    isSelected
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-amber-300 font-bold shadow-[0_0_8px_rgba(212,175,55,0.3)]'
                      : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>

          {!showCustomTagBox ? (
            <button
              type="button"
              onClick={() => setShowCustomTagBox(true)}
              className="text-[10px] text-amber-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Outra tag personalizada...</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="text"
                placeholder="Outro atributo (ex: Hidratação Inclusa)"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-[#D4AF37]"
              />
              <button
                type="button"
                onClick={() => {
                  if (customTagInput.trim() && !selectedTags.includes(customTagInput.trim())) {
                    setSelectedTags([...selectedTags, customTagInput.trim()]);
                    setCustomTagInput('');
                    setShowCustomTagBox(false);
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs"
              >
                Adicionar
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
            Valor Estimado do Serviço
          </label>
          <input
            type="text"
            placeholder="R$ 0,00"
            value={portPrice}
            onChange={handlePortPriceChange}
            required
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs font-bold text-amber-400 focus:border-[#D4AF37] outline-none"
          />
          <p className="text-[9px] text-slate-400 mt-0.5">
            * Máscara automática em Reais (R$). Digite ou apague os números e os valores serão formatados.
          </p>
        </div>

        <textarea
          placeholder="Descrição técnica da transformação..."
          value={portDesc}
          onChange={(e) => setPortDesc(e.target.value)}
          rows={2}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-[#D4AF37] outline-none"
        />

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4 text-black" />
          <span>{isEditing ? 'Salvar Alterações do Trabalho' : 'Publicar no Feed do App'}</span>
        </button>
      </form>
    </div>
  );
};
