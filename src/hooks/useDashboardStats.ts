'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  startOfWeek, endOfWeek, eachDayOfInterval, format, parseISO,
  isSameDay, isToday, subDays, startOfDay, endOfDay
} from 'date-fns'
import { TaskWithSubject } from '@/types/planner.types'

export interface SubjectProgress {
  id: string
  name: string
  color: string
  total: number
  completed: number
  rate: number
}

export interface WeeklyBar {
  name: string
  dateLabel: string
  completed: number
  planned: number
}

export interface DashboardStats {
  // KPI Cards
  studyHoursWeek: number
  tasksCompletedWeek: number
  activeSubjects: number
  currentStreak: number

  // Today
  todaysTasks: TaskWithSubject[]
  completedToday: number
  totalToday: number

  // Alerts
  missedTasksCount: number

  // Charts / breakdown
  weeklyActivity: WeeklyBar[]
  subjectProgress: SubjectProgress[]

  isLoading: boolean
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    studyHoursWeek: 0,
    tasksCompletedWeek: 0,
    activeSubjects: 0,
    currentStreak: 0,
    todaysTasks: [],
    completedToday: 0,
    totalToday: 0,
    missedTasksCount: 0,
    weeklyActivity: [],
    subjectProgress: [],
    isLoading: true,
  })

  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    setStats(prev => ({ ...prev, isLoading: true }))

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setStats(prev => ({ ...prev, isLoading: false }))
      return
    }

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*, subjects(id, name, color, difficulty)')
      .eq('user_id', user.id)
      .returns<TaskWithSubject[]>()

    if (error || !tasks) {
      console.error('Failed to fetch dashboard stats:', error)
      setStats(prev => ({ ...prev, isLoading: false }))
      return
    }

    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

    // ── This week tasks ─────────────────────────────────────────
    const thisWeekTasks = tasks.filter(t => {
      if (!t.due_date) return false
      const d = parseISO(t.due_date)
      return d >= weekStart && d <= weekEnd
    })

    const totalMinutesWeek = thisWeekTasks
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => acc + t.duration_minutes, 0)
    const studyHoursWeek = parseFloat((totalMinutesWeek / 60).toFixed(1))
    const tasksCompletedWeek = thisWeekTasks.filter(t => t.status === 'completed').length

    // ── Active subjects ──────────────────────────────────────────
    const activeSubjectIds = new Set(tasks.map(t => t.subject_id))
    const activeSubjects = activeSubjectIds.size

    // ── Today's tasks ────────────────────────────────────────────
    const todaysTasks = tasks
      .filter(t => t.due_date && isToday(parseISO(t.due_date)))
      .sort((a, b) => parseISO(a.due_date!).getTime() - parseISO(b.due_date!).getTime())

    const completedToday = todaysTasks.filter(t => t.status === 'completed').length
    const totalToday = todaysTasks.length

    // ── Missed tasks ─────────────────────────────────────────────
    const missedTasksCount = tasks.filter(t => t.status === 'missed').length

    // ── Streak (consecutive days with ≥1 completed task) ─────────
    let streak = 0
    let checkDay = startOfDay(now)
    // If nothing completed today yet, start checking from yesterday
    const hasCompletedToday = tasks.some(
      t => t.due_date && isToday(parseISO(t.due_date)) && t.status === 'completed'
    )
    if (!hasCompletedToday) {
      checkDay = subDays(checkDay, 1)
    }
    for (let i = 0; i < 365; i++) {
      const dayHasCompletion = tasks.some(t => {
        if (!t.due_date || t.status !== 'completed') return false
        return isSameDay(parseISO(t.due_date), checkDay)
      })
      if (!dayHasCompletion) break
      streak++
      checkDay = subDays(checkDay, 1)
    }

    // ── Weekly activity (last 7 days: completed vs planned) ───────
    const last7Days = eachDayOfInterval({
      start: subDays(now, 6),
      end: now,
    })

    const weeklyActivity: WeeklyBar[] = last7Days.map(day => {
      const dayTasks = tasks.filter(
        t => t.due_date && isSameDay(parseISO(t.due_date), day)
      )
      const completed = dayTasks
        .filter(t => t.status === 'completed')
        .reduce((acc, t) => acc + t.duration_minutes, 0)
      const planned = dayTasks.reduce((acc, t) => acc + t.duration_minutes, 0)
      return {
        name: format(day, 'EEE'),
        dateLabel: format(day, 'MMM d'),
        completed,
        planned,
      }
    })

    // ── Subject progress breakdown ────────────────────────────────
    const subjectMap = new Map<string, SubjectProgress>()
    tasks.forEach(t => {
      if (!t.subjects) return
      const key = t.subject_id
      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          id: t.subjects.id,
          name: t.subjects.name,
          color: t.subjects.color,
          total: 0,
          completed: 0,
          rate: 0,
        })
      }
      const entry = subjectMap.get(key)!
      entry.total++
      if (t.status === 'completed') entry.completed++
    })
    const subjectProgress: SubjectProgress[] = Array.from(subjectMap.values())
      .map(s => ({ ...s, rate: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0 }))
      .sort((a, b) => a.rate - b.rate) // weakest first

    setStats({
      studyHoursWeek,
      tasksCompletedWeek,
      activeSubjects,
      currentStreak: streak,
      todaysTasks,
      completedToday,
      totalToday,
      missedTasksCount,
      weeklyActivity,
      subjectProgress,
      isLoading: false,
    })
  }, [supabase])

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      await fetchStats()
    }
    init()
    return () => { isMounted = false }
  }, [fetchStats])

  return { ...stats, refresh: fetchStats }
}
