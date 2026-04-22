import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

interface AIGeneratedTask {
  title: string
  subject: string
  duration: number
  priority: number
}
import { AIGeneratedPlan, CreateStudyPlanInput } from '@/validators/planner.validators'
import { generateAIStudyPlan } from '@/services/ai.service'
import { addDays, differenceInDays, startOfDay, parseISO, format, eachDayOfInterval, getDay } from 'date-fns'

const DIFFICULTY_WEIGHT = {
  hard: 1.5,
  medium: 1.0,
  easy: 0.7
}

/**
 * Mathematically slice subjects chronologically allocating exact blocks.
 * Only schedules tasks on the user's selected study_days.
 */
function generateBaseSchedule(input: CreateStudyPlanInput): AIGeneratedPlan {
  const start = startOfDay(new Date(input.start_date))
  const end = startOfDay(new Date(input.end_date))

  // Filter to only the days the user wants to study
  const allDaysInRange = eachDayOfInterval({ start, end })
  const studyDates = allDaysInRange.filter(d => input.study_days.includes(getDay(d)))
  const totalStudyDays = studyDates.length

  if (totalStudyDays <= 0) throw new Error("No valid study days in the selected date range.")

  const totalMinutesAvailable = totalStudyDays * (input.hours_per_day * 60)
  
  const sortedSubjects = [...input.subjects].sort((a, b) => b.priority - a.priority)

  let totalWeight = 0
  sortedSubjects.forEach(sub => {
    totalWeight += DIFFICULTY_WEIGHT[sub.difficulty] * sub.priority
  })

  let currentMinuteOffset = 0
  const groups: Record<string, AIGeneratedTask[]> = {}

  sortedSubjects.forEach((sub) => {
    const subWeight = DIFFICULTY_WEIGHT[sub.difficulty] * sub.priority
    let allocatedMinutes = Math.floor((subWeight / totalWeight) * totalMinutesAvailable)
    
    const MAX_CHUNK = 120 

    while (allocatedMinutes > 0) {
      const chunk = Math.min(allocatedMinutes, MAX_CHUNK)
      const dayIndex = Math.floor(currentMinuteOffset / (input.hours_per_day * 60))
      
      if (dayIndex >= totalStudyDays) break 

      const targetDate = studyDates[dayIndex]
      const dStr = format(targetDate, 'yyyy-MM-dd')

      if (!groups[dStr]) groups[dStr] = []
      
      groups[dStr].push({
        title: `Study: ${sub.name}`,
        subject: sub.name,
        duration: chunk,
        priority: sub.priority || 5
      })

      allocatedMinutes -= chunk
      currentMinuteOffset += chunk
    }
  })

  return {
    schedule: Object.keys(groups).map(k => ({
      date: k,
      tasks: groups[k]
    }))
  }
}

export async function createStudyPlan(user_id: string, input: CreateStudyPlanInput) {
  const supabase = await createClient()

  // 1. Generate local algorithmic schedule
  const baseSchedule = generateBaseSchedule(input)

  if (baseSchedule.schedule.length === 0) {
    throw new Error('Algorithm failed to generate a valid allocation of time.')
  }

  // 2. Refine via AI
  let finalSchedule = await generateAIStudyPlan({
    subjects: input.subjects.map(s => ({ name: s.name, difficulty: s.difficulty, priority: s.priority })),
    constraints: { hours_per_day: input.hours_per_day, start_date: input.start_date, end_date: input.end_date, study_days: input.study_days }
  })

  // Mandatory Sanity Validation on AI Result
  if (finalSchedule) {
    const isValid = finalSchedule.schedule.every(day => {
       const dailySum = day.tasks.reduce((acc, t) => acc + t.duration, 0)
       return dailySum <= (input.hours_per_day * 60)
    })
    if (!isValid) {
      console.warn("AI exceeded daily hours limit. Forcing algorithmic fallback.")
      finalSchedule = null
    }
  }

  const isAIGenerated = finalSchedule !== null
  finalSchedule = finalSchedule || baseSchedule

  // 3. Start Database Mutations
  // Create Plan
  const { data: planInsert, error: planError } = await supabase.from('study_plans').insert({
    user_id,
    title: input.title,
    is_ai_generated: isAIGenerated,
  }).select('id').single()

  if (planError || !planInsert) throw new Error("Plan creation failed: " + planError?.message)

  const planId = planInsert.id

  // UPSERT subjects to ensure we have valid UUIDs mapped to their names
  // Create a cache lookup mapped internally
  const subjectIdLookup = new Map<string, string>()

  for (const sub of input.subjects) {
    let subId = sub.id

    if (!subId) {
      const { data: newSub, error: subError } = await supabase.from('subjects').insert({
        user_id,
        name: sub.name,
        difficulty: sub.difficulty,
        color: sub.color || '#E5E7EB'
      }).select('id').single()

      if (subError || !newSub) throw new Error("Subject creation failed")
      subId = newSub.id
    }
    subjectIdLookup.set(sub.name, subId)
  }

  // Map refined schedule to strict DB row insertion array
  const taskInsertions: {
    plan_id: string;
    subject_id: string;
    user_id: string;
    title: string;
    description: string | null;
    due_date: string;
    duration_minutes: number;
    status: 'pending';
  }[] = []

  finalSchedule.schedule.forEach(day => {
    day.tasks.forEach(t => {
      // strict matching protection (AI hallucinated names fall back to first random valid subject)
      const validSubId = subjectIdLookup.get(t.subject) || Array.from(subjectIdLookup.values())[0]
  
      taskInsertions.push({
        plan_id: planId,
        subject_id: validSubId,
        user_id,
        title: t.title || "Study Session",
        description: null,
        due_date: new Date(`${day.date}T10:00:00Z`).toISOString(),
        duration_minutes: t.duration,
        status: 'pending' as const
      })
    })
  })

  // Bulk Insert limits efficiently natively in Supabase 
  const { error: taskError } = await supabase.from('tasks').insert(taskInsertions)

  if (taskError) {
    // Rollback conceptually (Delete cascade handles rest if we deleted plan)
    await supabase.from('study_plans').delete().eq('id', planId)
    throw new Error("Task bulk generation failed: " + taskError.message)
  }

  return { planId, isAIGenerated, tasksCreated: taskInsertions.length }
}

export async function rescheduleMissedTasks(user_id: string, defaultDailyMinutes: number = 240) {
  const supabase = await createClient()

  // Find missed tasks
  const { data: missedTasks, error: missedError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user_id)
    .eq('status', 'missed')
    .order('due_date', { ascending: true })

  if (missedError) throw new Error(missedError.message)
  if (!missedTasks || missedTasks.length === 0) return { rescheduled: 0 }

  // We look forward across the next 7 days calculating current booked duration to find gaps
  const today = startOfDay(new Date())
  
  const { data: pendingTasks, error: pendingError } = await supabase
    .from('tasks')
    .select('id, duration_minutes, due_date')
    .eq('user_id', user_id)
    .eq('status', 'pending')
    .gte('due_date', today.toISOString())

  if (pendingError) throw new Error(pendingError.message)

  // Build lookup of daily booked metrics
  const bookedMinutesMap = new Map<string, number>()
  pendingTasks.forEach(t => {
    if (!t.due_date) return
    const dStr = startOfDay(parseISO(t.due_date)).toISOString()
    bookedMinutesMap.set(dStr, (bookedMinutesMap.get(dStr) || 0) + t.duration_minutes)
  })

  const updates: Database['public']['Tables']['tasks']['Row'][] = []
  
  let currentSearchDayOffset = 0
  
  // Reallocate missed tasks into nearest gap logic ensuring workload balance per day
  for (const missedTask of missedTasks) {
    let placed = false
    
    while (!placed) {
      if (currentSearchDayOffset > 60) break // Guard bound (if 2 months fully booked)

      const targetDay = addDays(today, currentSearchDayOffset)
      const targetStr = targetDay.toISOString()
      const booked = bookedMinutesMap.get(targetStr) || 0
      
      const gap = defaultDailyMinutes - booked

      if (gap >= missedTask.duration_minutes) {
        // Fits perfectly
        updates.push({ ...missedTask, due_date: targetStr, status: 'pending' })
        bookedMinutesMap.set(targetStr, booked + missedTask.duration_minutes)
        placed = true
      } else {
        // Find next day 
        currentSearchDayOffset++
      }
    }
  }

  // Perform bulk Upserts mapping mapped updates over to task table updates
  const { error: bulkUpdError } = await supabase.from('tasks').upsert(updates)

  if (bulkUpdError) throw new Error("Reschedule bulk failure: " + bulkUpdError.message)

  return { rescheduled: updates.length }
}
