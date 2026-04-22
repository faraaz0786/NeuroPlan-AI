import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database.types"

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']

/**
 * Retrieves all tasks for the currently authenticated user
 */
export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient()

  // Ensure user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching tasks:', error)
    throw new Error(error.message)
  }

  return data
}

/**
 * Creates a new task in the database
 */
export async function createTask(taskData: Omit<TaskInsert, 'user_id'>): Promise<Task> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...taskData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating task:', error)
    throw new Error(error.message)
  }

  return data
}

/**
 * Updates an existing task's status (for Kanban drag & drop)
 */
export async function updateTaskStatus(taskId: string, status: 'pending' | 'completed' | 'missed'): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating task status:', error)
    throw new Error(error.message)
  }
}

/**
 * Deletes a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting task:', error)
    throw new Error(error.message)
  }
}
