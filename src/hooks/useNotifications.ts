'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getNotificationsAction,
  markReadAction,
  markAllReadAction
} from '@/actions/notification.actions'
import type { Notification } from '@/services/notification.service'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const refresh = useCallback(async () => {
    const data = await getNotificationsAction()
    setNotifications(data)
  }, [])

  // Initial fetch
  useEffect(() => {
    let isMounted = true
    const init = async () => {
      const data = await getNotificationsAction()
      if (isMounted) {
        setNotifications(data)
        setIsLoading(false)
      }
    }
    init()
    return () => {
      isMounted = false
    }
  }, [])

  // Supabase Realtime subscription — fires on every INSERT to notifications
  useEffect(() => {
    const channel = supabase
      .channel('realtime:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          // Prepend the new notification to the top of the list
          setNotifications(prev => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markRead = useCallback(async (id: string) => {
    // Optimistic UI
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    )
    await markReadAction(id)
  }, [])

  const markAllRead = useCallback(async () => {
    // Optimistic UI
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    await markAllReadAction()
  }, [])

  return { notifications, unreadCount, isLoading, markRead, markAllRead, refresh }
}
