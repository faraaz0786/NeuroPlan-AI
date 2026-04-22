'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TaskWithSubject } from '@/types/planner.types'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns'

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Status color mapping for task pills
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending:   { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  completed: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  missed:    { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
}

export default function CalendarPage() {
  const supabase = createClient()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [tasks, setTasks] = useState<TaskWithSubject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch tasks for the visible month range
  const fetchMonthTasks = useCallback(async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const monthStart = startOfWeek(startOfMonth(currentMonth))
    const monthEnd = endOfWeek(endOfMonth(currentMonth))

    const { data, error } = await supabase
      .from('tasks')
      .select('*, subjects(id, name, color, difficulty)')
      .eq('user_id', user.id)
      .gte('due_date', monthStart.toISOString())
      .lte('due_date', monthEnd.toISOString())
      .order('due_date', { ascending: true })
      .returns<TaskWithSubject[]>()

    if (!error && data) {
      setTasks(data)
    }
    setIsLoading(false)
  }, [supabase, currentMonth])

  useEffect(() => {
    fetchMonthTasks()
  }, [fetchMonthTasks])

  // Build the calendar grid dates
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const gridStart = startOfWeek(monthStart)
    const gridEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [currentMonth])

  // Group tasks by date string for O(1) lookup
  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskWithSubject[]>()
    tasks.forEach(task => {
      if (!task.due_date) return
      const dateKey = format(parseISO(task.due_date), 'yyyy-MM-dd')
      if (!map.has(dateKey)) map.set(dateKey, [])
      map.get(dateKey)!.push(task)
    })
    return map
  }, [tasks])

  // Stats for the month
  const monthStats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const pending = tasks.filter(t => t.status === 'pending').length
    const missed = tasks.filter(t => t.status === 'missed').length
    return { total, completed, pending, missed }
  }, [tasks])

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto gap-6">
      {/* ── Page Header ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#191c1e]">Calendar</h1>
          <p className="text-[#6d7a77] mt-1 text-sm">
            View your study sessions and deadlines at a glance.
          </p>
        </div>

        {/* Month nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#f2f4f6] transition-colors text-[#3d4947]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-[#191c1e] min-w-[180px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#f2f4f6] transition-colors text-[#3d4947]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
            style={{ background: '#00685f15', color: '#00685f' }}
          >
            Today
          </button>
        </div>
      </div>

      {/* ── Stats Bar ────────────────────────────────── */}
      <div className="flex items-center gap-4">
        {[
          { label: 'Total Tasks', value: monthStats.total, color: '#00685f' },
          { label: 'Completed', value: monthStats.completed, color: '#059669' },
          { label: 'Pending', value: monthStats.pending, color: '#d97706' },
          { label: 'Missed', value: monthStats.missed, color: '#dc2626' },
        ].map(stat => (
          <div
            key={stat.label}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-[#e2e8f0]"
          >
            <div className="w-2 h-2 rounded-full" style={{ background: stat.color }} />
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#6d7a77]">{stat.label}</span>
            <span className="text-sm font-bold text-[#191c1e]">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* ── Calendar Grid ────────────────────────────── */}
      <div
        className="flex-1 overflow-hidden flex flex-col bg-white border border-[#e2e8f0]"
        style={{ borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#e2e8f0]" style={{ background: '#f7f9fb' }}>
          {DAY_HEADERS.map((day) => (
            <div key={day} className="py-3 text-center text-[11px] font-bold uppercase tracking-wider text-[#6d7a77]">
              {day}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 flex-1">
          {calendarDays.map((date, i) => {
            const dateKey = format(date, 'yyyy-MM-dd')
            const dayTasks = tasksByDate.get(dateKey) || []
            const isCurrentMonth = isSameMonth(date, currentMonth)
            const isDateToday = isToday(date)

            return (
              <div
                key={i}
                className={`min-h-[110px] border-r border-b border-[#e2e8f0] p-1.5 transition-colors ${
                  !isCurrentMonth ? 'bg-[#fafbfc] opacity-40' : 'bg-white hover:bg-[#f7f9fb]'
                }`}
              >
                {/* Date number */}
                <div className="flex items-center justify-between px-1 mb-1">
                  <span
                    className={`text-xs font-bold inline-flex items-center justify-center ${
                      isDateToday
                        ? 'w-6 h-6 rounded-full text-white'
                        : 'text-[#3d4947]'
                    }`}
                    style={isDateToday ? { background: '#00685f' } : undefined}
                  >
                    {format(date, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[9px] font-bold text-[#6d7a77]">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Task pills */}
                <div className="flex flex-col gap-0.5 px-0.5">
                  {dayTasks.slice(0, 3).map(task => {
                    const subjectColor = task.subjects?.color || '#6d7a77'
                    const statusStyle = STATUS_COLORS[task.status || 'pending'] || STATUS_COLORS.pending

                    return (
                      <div
                        key={task.id}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded truncate cursor-default"
                        style={{
                          background: `${subjectColor}18`,
                          color: subjectColor,
                          borderLeft: `2px solid ${subjectColor}`,
                        }}
                        title={`${task.title} (${task.duration_minutes}min) — ${task.status}`}
                      >
                        {task.subjects?.name || task.title}
                      </div>
                    )
                  })}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] font-bold text-[#6d7a77] pl-1">
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-[#6d7a77]">
              <CalendarDays className="w-4 h-4 animate-pulse" />
              Loading calendar...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
