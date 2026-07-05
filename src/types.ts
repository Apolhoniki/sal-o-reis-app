export type Period = 'manha' | 'tarde' | 'noite';

export type StatusColor = 'verde' | 'amarelo' | 'vermelho';

export type ThemeMode = 'preto-luxo' | 'branco-luxo';

export interface DaySchedule {
  id: string; // e.g. '2026-07-07'
  dayOfWeek: string; // e.g. 'Terça-feira'
  dayNumber: string; // e.g. 'Dia 07'
  dateFormatted: string; // e.g. '07/07/2026'
  periods: {
    manha: boolean; // true = free, false = occupied/blocked
    tarde: boolean;
    noite: boolean;
  };
  status: StatusColor;
  statusLabel: string; // e.g. "DISPONÍVEL: Manhã, Tarde e Noite"
  isBlocked?: boolean;
  extraSlots?: {
    manha?: boolean;
    tarde?: boolean;
    noite?: boolean;
  };
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  mediaType: 'image' | 'video';
  imageUrl: string;
  videoUrl?: string;
  description: string;
  durationMinutes: number;
  estimatedPrice: string;
  isPopular?: boolean;
  tags?: string[];
}

export interface AdsonProfileInfo {
  name: string;
  title: string;
  bio: string;
  experienceYears: number;
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
  operatingHours: string;
  avatarUrl: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: string;
  description: string;
  isPopular?: boolean;
}

export interface BookingRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  clientDescription?: string;
  dateId: string;
  dayFormatted: string; // e.g. "Quinta-feira - Dia 09"
  period: Period;
  serviceName?: string;
  referenceImageUrl?: string;
  inspirationImageUrl?: string;
  currentHairImageUrl?: string;
  confirmedTime?: string; // e.g. "15:30h"
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
  createdAt: string;
  notes?: string;
}

export interface ClientHistoryItem {
  id: string;
  clientName: string;
  clientPhone: string;
  clientDescription?: string;
  inspirationImageUrl?: string;
  currentHairImageUrl?: string;
  serviceDate: string;
  serviceName: string;
  notes: string;
  amountPaid: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'confirmation' | 'reminder' | 'system';
  clientPhone?: string;
}

export type ActiveTab = 'agendar' | 'portfolio' | 'notificacoes' | 'perfil' | 'admin';
