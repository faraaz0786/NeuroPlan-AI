'use server'

import { createClient } from '@/lib/supabase/server'
import {
  getUserNotifications,
  markAsRead,
  markAllRead,
  type Notification
} from '@/services/notification.service'

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return user.id
}

/**
 * Fetches all notifications for the authenticated user.
 */
export async function getNotificationsAction(): Promise<Notification[]> {
  const user_id = await getAuthenticatedUserId()
  return getUserNotifications(user_id)
}

/**
 * Marks a single notification as read for the authenticated user.
 */
export async function markReadAction(notification_id: string): Promise<void> {
  const user_id = await getAuthenticatedUserId()
  await markAsRead(notification_id, user_id)
}

/**
 * Marks all notifications as read for the authenticated user.
 */
export async function markAllReadAction(): Promise<void> {
  const user_id = await getAuthenticatedUserId()
  await markAllRead(user_id)
}
