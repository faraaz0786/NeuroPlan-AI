import { createClient } from '@/lib/supabase/server'
import { createNotificationsBatch } from '@/services/notification.service'
import { format } from 'date-fns'

/**
 * CRON TASK 1 — Runs every hour.
 * Finds tasks due within the next 3 hours and creates reminder notifications.
 * Duplicate-safe: the unique constraint on (user_id, type, reference_id) prevents
 * multiple reminders firing for the same task.
 */
export async function sendUpcomingReminders(): Promise<{ sent: number }> {
  const supabase = await createClient()
  const now = new Date()
  const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000)

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, user_id, title, due_date, subjects(name)')
    .eq('status', 'pending')
    .gte('due_date', now.toISOString())
    .lte('due_date', threeHoursLater.toISOString())

  if (error || !tasks || tasks.length === 0) {
    if (error) console.error('[reminder.service] sendUpcomingReminders fetch error:', error.message)
    return { sent: 0 }
  }

  type TaskRow = {
    id: string
    user_id: string
    title: string
    due_date: string
    subjects: { name: string } | null
  }

  const notifications = (tasks as unknown as TaskRow[]).map(task => {
    const dueTime = format(new Date(task.due_date), 'h:mm a')
    const subjectName = task.subjects?.name ?? 'your task'
    return {
      user_id: task.user_id,
      title: 'Upcoming Study Session',
      message: `You have "${subjectName}" scheduled at ${dueTime}. Time to prepare!`,
      type: 'reminder' as const,
      reference_id: task.id
    }
  })

  await createNotificationsBatch(notifications)
  return { sent: notifications.length }
}

/**
 * CRON TASK 2 — Runs daily at midnight.
 * Finds tasks that are still pending but past their due date.
 * Marks them as 'missed' and fires alert notifications.
 */
export async function detectMissedTasks(): Promise<{ detected: number }> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // Fetch tasks that are overdue
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, user_id, title, subjects(name)')
    .eq('status', 'pending')
    .lt('due_date', now)

  if (error || !tasks || tasks.length === 0) {
    if (error) console.error('[reminder.service] detectMissedTasks fetch error:', error.message)
    return { detected: 0 }
  }

  type TaskRow = {
    id: string
    user_id: string
    title: string
    subjects: { name: string } | null
  }

  const taskRows = tasks as unknown as TaskRow[]
  const taskIds = taskRows.map(t => t.id)

  // Batch update all overdue tasks to 'missed'
  const { error: updateError } = await supabase
    .from('tasks')
    .update({ status: 'missed' })
    .in('id', taskIds)

  if (updateError) {
    console.error('[reminder.service] detectMissedTasks update error:', updateError.message)
    return { detected: 0 }
  }

  // Create alert notifications
  const notifications = taskRows.map(task => ({
    user_id: task.user_id,
    title: 'Missed Study Session',
    message: `You missed "${task.subjects?.name ?? task.title}". Consider rescheduling it.`,
    type: 'alert' as const,
    reference_id: task.id
  }))

  await createNotificationsBatch(notifications)
  return { detected: taskRows.length }
}
