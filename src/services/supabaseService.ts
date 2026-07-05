import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdsonProfileInfo, DaySchedule, BookingRequest, ClientHistoryItem, AppNotification } from '../types';

// ==========================================
// 1. CONFIGURAÇÕES & PERFIL DO ADSON
// ==========================================

// Generic helper to safely write to Supabase when table schemas might miss optional columns
async function safeSupabaseWrite(
  tableName: string,
  initialPayload: Record<string, any>,
  method: 'upsert' | 'insert' = 'upsert'
): Promise<boolean> {
  let payload = { ...initialPayload };
  let attempts = 0;
  const maxAttempts = 6;

  while (attempts < maxAttempts) {
    attempts++;
    const { error } = method === 'upsert'
      ? await supabase.from(tableName).upsert(payload)
      : await supabase.from(tableName).insert(payload);

    if (!error) {
      return true;
    }

    if (error.message && error.message.includes("Could not find the '")) {
      const match = error.message.match(/Could not find the '([^']+)' column/);
      if (match && match[1]) {
        const missingColumn = match[1];
        console.warn(`[Supabase] Column '${missingColumn}' not found in '${tableName}'. Retrying without it...`);
        delete payload[missingColumn];
        continue;
      }
    }

    console.error(`[Supabase] Error writing to '${tableName}':`, error.message);
    return false;
  }
  return false;
}

export async function fetchProfileInfoFromSupabase(): Promise<AdsonProfileInfo | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('id', 'saloon_config')
      .single();

    if (error || !data) {
      console.warn('[Supabase] Could not fetch profile config:', error?.message);
      return null;
    }

    return {
      name: data.name || '',
      title: data.title || '',
      bio: data.bio || '',
      experienceYears: data.experience_years ?? 10,
      phone: data.phone || '',
      whatsapp: data.whatsapp || '',
      instagram: data.instagram || '',
      address: data.address || '',
      operatingHours: data.operating_hours || '',
      avatarUrl: data.avatar_url || '',
    };
  } catch (err) {
    console.error('[Supabase] Exception fetching profile info:', err);
    return null;
  }
}

export async function saveProfileInfoToSupabase(info: AdsonProfileInfo): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const payload: Record<string, any> = {
    id: 'saloon_config',
    name: info.name,
    title: info.title,
    bio: info.bio,
    experience_years: info.experienceYears,
    phone: info.phone,
    whatsapp: info.whatsapp,
    instagram: info.instagram,
    address: info.address,
    operating_hours: info.operatingHours,
    avatar_url: info.avatarUrl,
    updated_at: new Date().toISOString(),
  };

  return safeSupabaseWrite('configuracoes', payload, 'upsert');
}

// ==========================================
// 2. AGENDA & BLOQUEIO DE DIAS
// ==========================================

export async function fetchDaysFromSupabase(): Promise<DaySchedule[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('dias_agenda')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data.map((d) => ({
      id: d.id,
      dayOfWeek: d.day_of_week,
      dayNumber: d.day_number,
      dateFormatted: d.date_formatted,
      periods: d.periods || { manha: true, tarde: true, noite: true },
      status: d.status || 'verde',
      statusLabel: d.status_label || '',
      isBlocked: d.is_blocked || false,
      extraSlots: d.extra_slots || { manha: false, tarde: false, noite: false },
    }));
  } catch (err) {
    console.error('[Supabase] Exception fetching days:', err);
    return null;
  }
}

export async function saveDayScheduleToSupabase(day: DaySchedule): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const payload: Record<string, any> = {
    id: day.id,
    day_of_week: day.dayOfWeek,
    day_number: day.dayNumber,
    date_formatted: day.dateFormatted,
    periods: day.periods,
    status: day.status,
    status_label: day.statusLabel,
    is_blocked: day.isBlocked || false,
    extra_slots: day.extraSlots || { manha: false, tarde: false, noite: false },
    updated_at: new Date().toISOString(),
  };

  return safeSupabaseWrite('dias_agenda', payload, 'upsert');
}

export async function saveBulkDaysToSupabase(days: DaySchedule[]): Promise<boolean> {
  if (!isSupabaseConfigured() || days.length === 0) return false;

  try {
    const payload = days.map((d) => ({
      id: d.id,
      day_of_week: d.dayOfWeek,
      day_number: d.dayNumber,
      date_formatted: d.dateFormatted,
      periods: d.periods,
      status: d.status,
      status_label: d.statusLabel,
      is_blocked: d.isBlocked || false,
      extra_slots: d.extraSlots || { manha: false, tarde: false, noite: false },
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('dias_agenda').upsert(payload);

    if (error) {
      console.error('[Supabase] Error saving bulk days:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception saving bulk days:', err);
    return false;
  }
}

// ==========================================
// 3. AGENDAMENTOS & SOLICITAÇÕES
// ==========================================

export async function fetchBookingsFromSupabase(): Promise<BookingRequest[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return null;
    }

    return data.map((b) => ({
      id: b.id,
      clientName: b.client_name,
      clientPhone: b.client_phone,
      clientDescription: b.client_description,
      dateId: b.date_id,
      dayFormatted: b.day_formatted,
      period: b.period,
      serviceName: b.service_name,
      referenceImageUrl: b.reference_image_url,
      inspirationImageUrl: b.inspiration_image_url,
      currentHairImageUrl: b.current_hair_image_url,
      confirmedTime: b.confirmed_time,
      status: b.status,
      createdAt: b.created_at ? new Date(b.created_at).toLocaleString('pt-BR') : 'Recentemente',
      notes: b.notes,
    }));
  } catch (err) {
    console.error('[Supabase] Exception fetching bookings:', err);
    return null;
  }
}

export async function createBookingInSupabase(booking: BookingRequest): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('agendamentos').insert({
      id: booking.id,
      client_name: booking.clientName,
      client_phone: booking.clientPhone,
      client_description: booking.clientDescription || null,
      date_id: booking.dateId,
      day_formatted: booking.dayFormatted,
      period: booking.period,
      service_name: booking.serviceName || null,
      reference_image_url: booking.referenceImageUrl || null,
      inspiration_image_url: booking.inspirationImageUrl || null,
      current_hair_image_url: booking.currentHairImageUrl || null,
      confirmed_time: booking.confirmedTime || null,
      status: booking.status,
      notes: booking.notes || null,
    });

    if (error) {
      console.error('[Supabase] Error creating booking:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception creating booking:', err);
    return false;
  }
}

export async function updateBookingStatusInSupabase(
  bookingId: string,
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado',
  confirmedTime?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const payload: Record<string, any> = { status };
    if (confirmedTime !== undefined) {
      payload.confirmed_time = confirmedTime;
    }

    const { error } = await supabase.from('agendamentos').update(payload).eq('id', bookingId);

    if (error) {
      console.error('[Supabase] Error updating booking status:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception updating booking status:', err);
    return false;
  }
}

// ==========================================
// 4. CLIENTES SALVAS & HISTÓRICO
// ==========================================

export async function fetchClientsFromSupabase(): Promise<ClientHistoryItem[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return null;
    }

    return data.map((c) => ({
      id: c.id,
      clientName: c.client_name,
      clientPhone: c.client_phone,
      clientDescription: c.client_description,
      inspirationImageUrl: c.inspiration_image_url,
      currentHairImageUrl: c.current_hair_image_url,
      serviceDate: c.service_date,
      serviceName: c.service_name,
      notes: c.notes,
      amountPaid: c.amount_paid,
    }));
  } catch (err) {
    console.error('[Supabase] Exception fetching clients:', err);
    return null;
  }
}

export async function saveClientToSupabase(client: ClientHistoryItem): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('clientes').upsert({
      id: client.id,
      client_name: client.clientName,
      client_phone: client.clientPhone,
      client_description: client.clientDescription || null,
      inspiration_image_url: client.inspirationImageUrl || null,
      current_hair_image_url: client.currentHairImageUrl || null,
      service_date: client.serviceDate,
      service_name: client.serviceName,
      notes: client.notes,
      amount_paid: client.amountPaid,
    });

    if (error) {
      console.error('[Supabase] Error saving client:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception saving client:', err);
    return false;
  }
}

export async function deleteClientFromSupabase(clientId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('clientes').delete().eq('id', clientId);

    if (error) {
      console.error('[Supabase] Error deleting client:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception deleting client:', err);
    return false;
  }
}

export async function deleteClientGroupFromSupabase(clientName: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .ilike('client_name', clientName.trim());

    if (error) {
      console.error('[Supabase] Error deleting client group:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception deleting client group:', err);
    return false;
  }
}

// ==========================================
// 5. NOTIFICAÇÕES (CLIENTE E ADMIN)
// ==========================================

export async function fetchNotificationsFromSupabase(clientPhone?: string, isAdmin?: boolean): Promise<AppNotification[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    let query = supabase.from('notificacoes').select('*').order('created_at', { ascending: false });

    // If client (and not admin), filter by client's phone or general announcements
    if (!isAdmin) {
      if (clientPhone && clientPhone.trim()) {
        const clean = clientPhone.trim();
        query = query.or(`client_phone.eq.${clean},client_phone.eq.GERAL,client_phone.is.null`);
      } else {
        // Unidentified client: show only general broadcast notifications
        query = query.or('client_phone.eq.GERAL,client_phone.is.null');
      }
    }

    const { data, error } = await query;

    if (error || !data) {
      return null;
    }

    return data.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      timestamp: n.timestamp || (n.created_at ? new Date(n.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Hoje'),
      read: n.read || false,
      type: n.type || 'confirmation',
      clientPhone: n.client_phone,
    }));
  } catch (err) {
    console.error('[Supabase] Exception fetching notifications:', err);
    return null;
  }
}

export async function createNotificationInSupabase(notif: AppNotification): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('notificacoes').insert({
      id: notif.id,
      client_phone: notif.clientPhone || 'GERAL',
      title: notif.title,
      message: notif.message,
      type: notif.type || 'confirmation',
      read: notif.read || false,
      timestamp: notif.timestamp || 'Agora',
    });

    if (error) {
      console.error('[Supabase] Error creating notification:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception creating notification:', err);
    return false;
  }
}

export async function markNotificationReadInSupabase(notificationId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from('notificacoes').update({ read: true }).eq('id', notificationId);
    if (error) {
      console.error('[Supabase] Error marking notification read:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception marking notification read:', err);
    return false;
  }
}

export async function markAllNotificationsReadInSupabase(clientPhone?: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    let query = supabase.from('notificacoes').update({ read: true });
    if (clientPhone) {
      query = query.eq('client_phone', clientPhone);
    } else {
      query = query.eq('read', false);
    }
    const { error } = await query;
    if (error) {
      console.error('[Supabase] Error marking all notifications read:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception marking all notifications read:', err);
    return false;
  }
}

// ==========================================
// 6. INSCRIÇÃO EM TEMPO REAL (REALTIME)
// ==========================================

export function subscribeToRealtimeUpdates(callbacks: {
  onProfileChange?: (profile: AdsonProfileInfo) => void;
  onDaysChange?: () => void;
  onBookingsChange?: () => void;
  onClientsChange?: () => void;
  onNotificationsChange?: () => void;
}) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('salao_reis_realtime_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'configuracoes' },
      async () => {
        if (callbacks.onProfileChange) {
          const updated = await fetchProfileInfoFromSupabase();
          if (updated) callbacks.onProfileChange(updated);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'dias_agenda' },
      () => {
        if (callbacks.onDaysChange) callbacks.onDaysChange();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'agendamentos' },
      () => {
        if (callbacks.onBookingsChange) callbacks.onBookingsChange();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'clientes' },
      () => {
        if (callbacks.onClientsChange) callbacks.onClientsChange();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notificacoes' },
      () => {
        if (callbacks.onNotificationsChange) callbacks.onNotificationsChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
