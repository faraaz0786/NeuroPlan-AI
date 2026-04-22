import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePlannerStore } from '@/store/usePlannerStore'
import { TaskStatus, TaskWithSubject } from '@/types/planner.types'

import { toast } from 'sonner'

export function useTasks() {
  const supabase = createClient()
  const { setTasks, updateTaskStatus, updateTaskDate, revertTask, tasks } = usePlannerStore()
  const [isLoading, setIsLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*, subjects(id, name, color, difficulty)')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })
      .returns<TaskWithSubject[]>()

    if (error) {
      toast.error('Failed to sync tasks from database')
      console.error('Failed to fetch tasks:', error)
    } else if (data) {
      setTasks(data)
    }
    setIsLoading(false)
  }, [supabase, setTasks])

  // Initial fetch
  useEffect(() => {
    let isMounted = true
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        if (isMounted) setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*, subjects(id, name, color, difficulty)')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })
        .returns<TaskWithSubject[]>()

      if (isMounted) {
        if (error) {
          toast.error('Failed to sync tasks from database')
          console.error('Failed to fetch tasks:', error)
        } else if (data) {
          setTasks(data)
        }
        setIsLoading(false)
      }
    }
    init()
    return () => {
      isMounted = false
    }
  }, [supabase, setTasks])

  const moveTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const originalTask = tasks.find(t => t.id === taskId)
    if (!originalTask || originalTask.status === newStatus) return

    // Optimistic Update
    updateTaskStatus(taskId, newStatus)
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
      toast.error('Failed to move task. Reverting changes.')
      revertTask(originalTask)
    }
  }

  const rescheduleTask = async (taskId: string, newDateIso: string) => {
    const originalTask = tasks.find(t => t.id === taskId)
    if (!originalTask || originalTask.due_date === newDateIso) return

    // Optimistic Update
    updateTaskDate(taskId, newDateIso)

    const { error } = await supabase
      .from('tasks')
      .update({ due_date: newDateIso })
      .eq('id', taskId)

    if (error) {
      toast.error('Failed to reschedule task. Reverting changes.')
      revertTask(originalTask)
    } else {
      toast.success('Task rescheduled successfully')
    }
  }

  return { isLoading, fetchTasks, moveTaskStatus, rescheduleTask }
}
