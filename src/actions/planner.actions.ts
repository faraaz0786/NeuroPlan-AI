'use server'

import { createClient } from '@/lib/supabase/server'
import { createStudyPlan, rescheduleMissedTasks } from '@/services/planner.service'
import { CreateStudyPlanInputSchema, CreateStudyPlanInput } from '@/validators/planner.validators'

export type ServerActionResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

export async function createStudyPlanAction(
  payload: CreateStudyPlanInput
): Promise<ServerActionResponse<{ planId: string, isAIGenerated: boolean, tasksCreated: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return { success: false, error: 'Unauthorized' }
    }

    const parseResult = CreateStudyPlanInputSchema.safeParse(payload)
    
    if (!parseResult.success) {
      return { success: false, error: 'Invalid input format' }
    }

    const result = await createStudyPlan(user.id, parseResult.data)
    
    return { success: true, data: result }
  } catch (error) {
    console.error("Action Error (createStudyPlanAction):", error)
    return { success: false, error: error instanceof Error ? error.message : "Internal Server Error" }
  }
}

export async function rescheduleMissedTasksAction(): Promise<ServerActionResponse<{ rescheduled: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return { success: false, error: 'Unauthorized' }
    }

    const result = await rescheduleMissedTasks(user.id)
    
    return { success: true, data: result }
  } catch (error) {
    console.error("Action Error (rescheduleMissedTasksAction):", error)
    return { success: false, error: error instanceof Error ? error.message : "Internal Server Error" }
  }
}
