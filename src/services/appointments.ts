import { createClient } from '@/lib/supabase/client';
import type { Appointment } from '@/types';
import type { AppointmentFormData } from '@/validations';

export async function getAppointments(
  businessId: string,
  filters?: {
    status?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: Appointment[]; count: number }> {
  const supabase = createClient();

  let query = supabase
    .from('appointments')
    .select('*, service:services(id,name,price_type,price_min,price_max)', { count: 'exact' })
    .eq('business_id', businessId)
    .order('scheduled_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.from) {
    query = query.gte('scheduled_at', filters.from);
  }
  if (filters?.to) {
    query = query.lte('scheduled_at', filters.to);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

export async function getAppointment(appointmentId: string): Promise<Appointment | null> {
  const supabase = createClient();

  const { data } = await supabase
    .from('appointments')
    .select('*, service:services(*)')
    .eq('id', appointmentId)
    .single();

  return data;
}

export async function createAppointment(
  businessId: string,
  formData: AppointmentFormData,
  conversationId?: string
): Promise<Appointment> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      business_id: businessId,
      service_id: formData.service_id || null,
      conversation_id: conversationId || null,
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone || null,
      customer_email: formData.customer_email || null,
      date_of_birth: formData.date_of_birth || null,
      insurance_provider: formData.insurance_provider || null,
      insurance_member_id: formData.insurance_member_id || null,
      scheduled_at: formData.scheduled_at,
      duration_minutes: formData.duration_minutes,
      notes: formData.notes || null,
      status: formData.status,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAppointment(
  appointmentId: string,
  data: Partial<AppointmentFormData>
): Promise<Appointment> {
  const supabase = createClient();

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone || null,
      customer_email: data.customer_email || null,
      date_of_birth: data.date_of_birth || null,
      insurance_provider: data.insurance_provider || null,
      insurance_member_id: data.insurance_member_id || null,
      service_id: data.service_id || null,
      scheduled_at: data.scheduled_at,
      duration_minutes: data.duration_minutes,
      notes: data.notes || null,
      status: data.status,
    })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) throw error;
  return appointment;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string,
  businessId?: string
): Promise<void> {
  const supabase = createClient();

  let query = supabase.from('appointments').update({ status }).eq('id', appointmentId);
  if (businessId) query = query.eq('business_id', businessId);

  const { error } = await query;
  if (error) throw error;
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId);

  if (error) throw error;
}

export async function isSlotAvailable(
  businessId: string,
  scheduledAt: string,
  durationMinutes: number = 60,
  excludeAppointmentId?: string
): Promise<boolean> {
  const supabase = createClient();
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60000);

  let query = supabase
    .from('appointments')
    .select('id, scheduled_at, duration_minutes')
    .eq('business_id', businessId)
    .not('status', 'in', '("cancelled","completed")')
    // overlap: existing.start < new.end AND existing.end > new.start
    .lt('scheduled_at', end.toISOString())
    .gt('scheduled_at', new Date(start.getTime() - 8 * 60 * 60000).toISOString()); // rough window

  if (excludeAppointmentId) {
    query = query.neq('id', excludeAppointmentId);
  }

  const { data } = await query;

  // Precise overlap check in JS
  for (const appt of data || []) {
    const aStart = new Date(appt.scheduled_at).getTime();
    const aEnd = aStart + (appt.duration_minutes || 60) * 60000;
    const newStart = start.getTime();
    const newEnd = end.getTime();
    if (aStart < newEnd && aEnd > newStart) return false;
  }
  return true;
}

export async function getAvailableSlots(
  businessId: string,
  date: string,
  durationMinutes: number = 60
): Promise<string[]> {
  const supabase = createClient();

  const dayOfWeek = new Date(date).getDay();

  const { data: hours } = await supabase
    .from('business_hours')
    .select('*')
    .eq('business_id', businessId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_open', true)
    .single();

  if (!hours || !hours.open_time || !hours.close_time) return [];

  const { data: existing } = await supabase
    .from('appointments')
    .select('scheduled_at, duration_minutes')
    .eq('business_id', businessId)
    .gte('scheduled_at', `${date}T00:00:00`)
    .lte('scheduled_at', `${date}T23:59:59`)
    .not('status', 'eq', 'cancelled');

  const bookedSlots = new Set<string>();
  (existing || []).forEach((appt) => {
    const start = new Date(appt.scheduled_at);
    const slot = start.toTimeString().substring(0, 5);
    bookedSlots.add(slot);
    const blockSlots = Math.ceil(appt.duration_minutes / 30);
    for (let i = 1; i < blockSlots; i++) {
      const blocked = new Date(start.getTime() + i * 30 * 60000);
      bookedSlots.add(blocked.toTimeString().substring(0, 5));
    }
  });

  const slots: string[] = [];
  const [openH, openM] = hours.open_time.split(':').map(Number);
  const [closeH, closeM] = hours.close_time.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  for (let m = openMinutes; m + durationMinutes <= closeMinutes; m += 30) {
    const h = Math.floor(m / 60).toString().padStart(2, '0');
    const min = (m % 60).toString().padStart(2, '0');
    const timeStr = `${h}:${min}`;
    if (!bookedSlots.has(timeStr)) {
      slots.push(timeStr);
    }
  }

  return slots;
}
