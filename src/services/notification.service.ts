import { createClient } from '@/lib/supabase/server'

export type NotificationType = 'reminder' | 'alert' | 'system'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  reference_id: string | null
  created_at: string
}

/**
 * Creates a single notification.
 * Uses onConflict('user_id,type,reference_id') to silently ignore duplicates.
 * This prevents the same reminder firing multiple times for the same task.
 */
export async function createNotification(
  user_id: string,
  title: string,
  message: string,
  type: NotificationType,
  reference_id?: string
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .upsert(
      { user_id, title, message, type, reference_id: reference_id ?? null, is_read: false },
      { onConflict: 'user_id,type,reference_id', ignoreDuplicates: true }
    )

  if (error) {
    console.error('[notification.service] createNotification error:', error.message)
  }
}

/**
 * Batch-inserts multiple notifications efficiently.
 * Duplicate-safe via the same upsert strategy.
 */
export async function createNotificationsBatch(
  notifications: Array<{
    user_id: string
    title: string
    message: string
    type: NotificationType
    reference_id?: string
  }>
): Promise<void> {
  if (notifications.length === 0) return
  const supabase = await createClient()
  const rows = notifications.map(n => ({
    user_id: n.user_id,
    title: n.title,
    message: n.message,
    type: n.type,
    reference_id: n.reference_id ?? null,
    is_read: false
  }))

  const { error } = await supabase
    .from('notifications')
    .upsert(rows, { onConflict: 'user_id,type,reference_id', ignoreDuplicates: true })

  if (error) {
    console.error('[notification.service] createNotificationsBatch error:', error.message)
  }
}

/**
 * Returns all notifications for a user, newest first.
 */
export async function getUserNotifications(user_id: string): Promise<Notification[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[notification.service] getUserNotifications error:', error.message)
    return []
  }
  return (data ?? []) as Notification[]
}

/**
 * Marks a single notification as read, scoped to the user for security.
 */
export async function markAsRead(notification_id: string, user_id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notification_id)
    .eq('user_id', user_id)

  if (error) {
    console.error('[notification.service] markAsRead error:', error.message)
  }
}

/**
 * Marks ALL notifications as read for a user.
 */
export async function markAllRead(user_id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user_id)
    .eq('is_read', false)

  if (error) {
    console.error('[notification.service] markAllRead error:', error.message)
  }
}
