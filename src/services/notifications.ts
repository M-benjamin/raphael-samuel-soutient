import { createClient } from '@/lib/supabase/client';
import type { Notification } from '@/types';

export async function getNotifications(businessId: string): Promise<Notification[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getUnreadCount(businessId: string): Promise<number> {
  const supabase = createClient();
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('is_read', false);
  if (error) return 0;
  return count ?? 0;
}

export async function markAsRead(notificationId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
}

export async function markAllAsRead(businessId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('business_id', businessId)
    .eq('is_read', false);
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('notifications').delete().eq('id', notificationId);
}

export async function deleteAllRead(businessId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('notifications')
    .delete()
    .eq('business_id', businessId)
    .eq('is_read', true);
}
