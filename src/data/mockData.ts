import { DaySchedule, PortfolioItem, ServiceItem, BookingRequest, ClientHistoryItem, AppNotification, AdsonProfileInfo } from '../types';
import { generateInitialScheduleDays } from '../utils/dateHelpers';

export const ADSON_WHATSAPP_NUMBER = '5511999998888'; // Adson's direct WhatsApp
export const ADSON_PHONE = '11999998888';
export const ADSON_NAME = 'Adson Reis';
export const SALAO_NAME = 'Salão Reis';
export const SALAO_ADDRESS = 'Av. das Nações, 1420 - Centro, São Paulo - SP';
export const SALAO_INSTAGRAM = '@salaoreis_oficial';

export const INITIAL_PROFILE_INFO: AdsonProfileInfo = {
  name: 'Adson Reis',
  title: 'Master Hairstylist & Specialist em Visagismo',
  bio: 'Apaixonado pela arte da transformação feminina há mais de 8 anos. Especialista internacional em técnicas de Morena Iluminada sem marcas, Blond Dourado saudável e Visagismo Facial personalizado. Meu objetivo é realçar a beleza única de cada cliente com sofisticação e saúde capilar em cada detalhe.',
  experienceYears: 8,
  phone: '(11) 99999-8888',
  whatsapp: '5511999998888',
  instagram: '@salaoreis_oficial',
  address: 'Av. das Nações, 1420 - Centro, São Paulo - SP',
  operatingHours: 'Terça a Sábado: 08:00h às 21:00h',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
};

export const INITIAL_DAYS: DaySchedule[] = generateInitialScheduleDays();

export const INITIAL_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'port-1',
    title: 'Morena Iluminada Avelã (Vídeo)',
    category: 'Morena Iluminada',
    mediaType: 'video',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hairstylist-brushing-a-womans-hair-43093-large.mp4',
    description: 'Técnica exclusiva com contraste suave e preservação da saúde dos fios. Efeito natural e movimento espetacular em vídeo.',
    durationMinutes: 180,
    estimatedPrice: 'R$ 380,00',
    isPopular: true,
    tags: ['Mais Pedido', 'Menos Agressivo', 'Com Química'],
  },
  {
    id: 'port-2',
    title: 'Loiro Dourado Butter Blond',
    category: 'Mechas & Coloração',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
    description: 'Mechas em tom dourado mantendo a raiz esfumada para crescimento natural sem marcação.',
    durationMinutes: 240,
    estimatedPrice: 'R$ 450,00',
    isPopular: true,
    tags: ['Mais Pedido', 'Com Botox'],
  },
  {
    id: 'port-3',
    title: 'Corte Butterfly & Escova Modelada (Vídeo)',
    category: 'Cortes Femininos',
    mediaType: 'video',
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-smiling-with-her-hair-in-the-wind-41315-large.mp4',
    description: 'Corte em camadas com balanço e leveza. Assista ao vídeo de finalização com movimento natural.',
    durationMinutes: 90,
    estimatedPrice: 'R$ 160,00',
    tags: ['Mais Rápido', 'Sem Química', 'Pouco Tempo'],
  },
  {
    id: 'port-4',
    title: 'Tratamento Reconstrução & Brilho Espelhado',
    category: 'Tratamento & Escova',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    description: 'Cauterização com aminoácidos e selamento térmico para fios alinhados, sem frizz e extremamente sedosos.',
    durationMinutes: 120,
    estimatedPrice: 'R$ 220,00',
    tags: ['Menos Agressivo', 'Sem Química', 'Com Botox'],
  },
  {
    id: 'port-5',
    title: 'Penteado Semi-Preso Elegante',
    category: 'Penteados & Eventos',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    description: 'Ideal para madrinhas, formandas e festas sofisticadas. Fixação duradoura e acabamento impecável.',
    durationMinutes: 90,
    estimatedPrice: 'R$ 250,00',
    tags: ['Pouco Tempo', 'Sem Química'],
  },
  {
    id: 'port-6',
    title: 'Corte Bob Francês Moderno',
    category: 'Cortes Femininos',
    mediaType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
    description: 'Corte na altura do queixo, jovial e prático para o dia a dia com um toque de elegância clássica.',
    durationMinutes: 60,
    estimatedPrice: 'R$ 150,00',
    tags: ['Mais Rápido', 'Sem Química', 'Permanente'],
  }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Mechas & Balayage Especial',
    category: 'Coloração',
    duration: '3h30 - 4h',
    price: 'A partir de R$ 380,00',
    description: 'Descoloração personalizada com protetor plex, tonalização e hidratação profunda pós-química.',
    isPopular: true,
  },
  {
    id: 'srv-2',
    name: 'Morena Iluminada',
    category: 'Coloração',
    duration: '3h',
    price: 'A partir de R$ 350,00',
    description: 'Pontos de luz estratégicos para iluminação suave e elegante mantendo a base natural.',
    isPopular: true,
  },
  {
    id: 'srv-3',
    name: 'Corte Feminino com Visagismo',
    category: 'Cortes',
    duration: '1h',
    price: 'R$ 150,00',
    description: 'Avaliação das feições faciais, lavagem especial com massagem capilar, corte e escova finalizadora.',
  },
  {
    id: 'srv-4',
    name: 'Reconstrução Nutritiva Capilar',
    category: 'Tratamentos',
    duration: '1h30',
    price: 'R$ 200,00',
    description: 'Tratamento intensivo para recuperar a elasticidade e resistência de fios danificados ou porosos.',
  },
  {
    id: 'srv-5',
    name: 'Progressiva Orgânica sem Formol',
    category: 'Alisamentos',
    duration: '2h30',
    price: 'A partir de R$ 280,00',
    description: 'Alinhamento térmico de alta performance com ácidos orgânicos. Liso natural e brilho radiante.',
  },
  {
    id: 'srv-6',
    name: 'Escova Modelada ou Lisa',
    category: 'Finalização',
    duration: '45 min',
    price: 'R$ 80,00',
    description: 'Lavagem relaxante e escovação com protetor térmico de luxo.',
  },
];

export const INITIAL_BOOKINGS: BookingRequest[] = [
  {
    id: 'bk-1',
    clientName: 'Fernanda Lima',
    clientPhone: '11988776655',
    clientDescription: 'Gostaria de iluminação dourada mantendo a raiz natural castanha.',
    dateId: '2026-07-08',
    dayFormatted: 'Quarta-feira - Dia 08',
    period: 'tarde',
    serviceName: 'Morena Iluminada Avelã',
    referenceImageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    inspirationImageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    currentHairImageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    status: 'pendente',
    createdAt: '2026-07-04 09:15',
    notes: 'Cliente quer clarear apenas as pontas.',
  },
  {
    id: 'bk-2',
    clientName: 'Juliana Paes',
    clientPhone: '11977665544',
    clientDescription: 'Corte repicado para dar volume.',
    dateId: '2026-07-07',
    dayFormatted: 'Terça-feira - Dia 07',
    period: 'manha',
    serviceName: 'Corte Butterfly & Escova',
    confirmedTime: '10:00h',
    status: 'confirmado',
    createdAt: '2026-07-03 14:20',
    notes: 'Confirmado no WhatsApp.',
  },
  {
    id: 'bk-3',
    clientName: 'Camila Pitanga',
    clientPhone: '11966554433',
    clientDescription: 'Tratamento de reconstrução pós-química.',
    dateId: '2026-07-10',
    dayFormatted: 'Sexta-feira - Dia 10',
    period: 'tarde',
    serviceName: 'Reconstrução Nutritiva Capilar',
    referenceImageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    inspirationImageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    currentHairImageUrl: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80',
    status: 'pendente',
    createdAt: '2026-07-04 11:45',
  }
];

export const INITIAL_CLIENT_HISTORY: ClientHistoryItem[] = [
  {
    id: 'hist-1',
    clientName: 'Fernanda Lima',
    clientPhone: '11988776655',
    clientDescription: 'Irmã da Juliana, prefere tonalidade avelã e fios com brilho natural.',
    inspirationImageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    currentHairImageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    serviceDate: '10/05/2026',
    serviceName: 'Morena Iluminada',
    notes: 'Fez mechas douradas e tonalização com 8.31 + 10 vol. Cabelo reagiu super bem, recomendada máscara nutritiva em casa.',
    amountPaid: 'R$ 380,00',
  },
  {
    id: 'hist-2',
    clientName: 'Juliana Paes',
    clientPhone: '11977665544',
    clientDescription: 'Cliente frequente de corte e escova modelada.',
    serviceDate: '18/04/2026',
    serviceName: 'Corte e Escova',
    notes: 'Corte repicado médio, franja cortada na altura da boca. Escova modelada nas pontas.',
    amountPaid: 'R$ 150,00',
  },
  {
    id: 'hist-3',
    clientName: 'Camila Pitanga',
    clientPhone: '11966554433',
    clientDescription: 'Quer manter a progressiva em dia e retoque de raiz.',
    inspirationImageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    currentHairImageUrl: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80',
    serviceDate: '02/06/2026',
    serviceName: 'Progressiva Orgânica',
    notes: 'Aplicação do produto com tempo de pausa de 50 minutos. Fios extremamente lisos e alinhados.',
    amountPaid: 'R$ 280,00',
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Agendamento Confirmado!',
    message: 'Seu agendamento para Terça-feira (Dia 07) no período da Manhã às 10:00h foi confirmado com o Adson.',
    timestamp: 'Hoje, 10:05',
    read: false,
    type: 'confirmation',
  },
  {
    id: 'notif-2',
    title: 'Dica do Salão Reis',
    message: 'Lembre-se de não lavar os cabelos no dia do procedimento de mechas para proteger o couro cabeludo.',
    timestamp: 'Ontem',
    read: true,
    type: 'system',
  },
];
