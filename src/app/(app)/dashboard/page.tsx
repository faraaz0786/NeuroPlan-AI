'use client'

import React from 'react'
import {
  Clock, CheckCircle2, BookOpen, AlertTriangle, TrendingUp, CalendarDays, Flame
} from 'lucide-react'
import { ActivityGraph } from '@/components/dashboard/ActivityGraph'
import { DailyAgendaCard } from '@/components/dashboard/DailyAgendaCard'
import { StatsRing } from '@/components/dashboard/StatsRing'
import { StudyStreakCard } from '@/components/dashboard/StudyStreakCard'
import { SubjectBreakdownCard } from '@/components/dashboard/SubjectBreakdownCard'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { format } from 'date-fns'

// ─────────────────────────────────────────────────────────────
// Greeting helpers
// ─────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─────────────────────────────────────────────────────────────
// KPI card
// ─────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  borderColor,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub: string
  accent?: string
  borderColor?: string
}) {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 hover:shadow-md transition-shadow relative overflow-hidden"
      style={{ borderLeft: borderColor ? `4px solid ${borderColor}` : undefined }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6d7a77]">{label}</p>
          <p className="text-3xl font-extrabold tracking-tight" style={{ color: accent || '#191c1e' }}>
            {value}
          </p>
          <p className="text-[12px] text-[#3d4947] font-medium">{sub}</p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: (accent || '#00685f') + '15' }}
        >
          <Icon className="w-5 h-5" style={{ color: accent || '#00685f' }} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#e6e8ea] ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><Skeleton className="h-72" /></div>
        <Skeleton className="h-72" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Section card wrapper
// ─────────────────────────────────────────────────────────────
function SectionCard({
  title, subtitle, icon: Icon, badge, children, className,
}: {
  title: string
  subtitle?: string
  icon?: React.ElementType
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-[#e2e8f0] overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#f2f4f6]">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" style={{ color: '#00685f' }} />}
          <div>
            <h2 className="text-[15px] font-bold text-[#191c1e]">{title}</h2>
            {subtitle && <p className="text-[11px] text-[#6d7a77] mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {badge}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const {
    studyHoursWeek,
    tasksCompletedWeek,
    activeSubjects,
    currentStreak,
    todaysTasks,
    completedToday,
    totalToday,
    missedTasksCount,
    weeklyActivity,
    subjectProgress,
    isLoading,
    refresh,
  } = useDashboardStats()

  if (isLoading) return <DashboardSkeleton />

  const today = format(new Date(), 'EEEE, MMMM d')
  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#00685f] mb-1">
            Command Center
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">
            {getGreeting()} 👋
          </h1>
          <p className="text-[#3d4947] mt-1 font-medium flex items-center gap-2 text-sm">
            <CalendarDays className="w-4 h-4 text-[#6d7a77]" />
            {today}
          </p>
        </div>
        {missedTasksCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-50 border border-red-200 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            {missedTasksCount} missed task{missedTasksCount !== 1 ? 's' : ''} need attention
          </div>
        )}
      </div>

      {/* ── Row 1: Progress ring + KPI cards ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* Progress ring */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-6 flex flex-col items-center justify-center gap-4">
          <StatsRing completed={completedToday} total={totalToday} size={120} />
          <div className="text-center space-y-3 w-full">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6d7a77]">
              {completedToday}/{totalToday} tasks today
            </p>
            <div className="w-full h-px bg-[#f2f4f6]" />
            <StudyStreakCard streak={currentStreak} />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            icon={Clock}
            label="Study Hours"
            value={`${studyHoursWeek}h`}
            sub="Completed this week"
            borderColor="#00685f"
            accent="#00685f"
          />
          <KpiCard
            icon={CheckCircle2}
            label="Tasks Done"
            value={tasksCompletedWeek}
            sub={`${completionRate}% of today's plan`}
            borderColor="#008378"
            accent="#008378"
          />
          <KpiCard
            icon={Flame}
            label="Study Streak"
            value={`${currentStreak}d`}
            sub="Keep it up!"
            borderColor="#fea619"
            accent="#855300"
          />
        </div>
      </div>

      {/* ── Row 2: Today's Agenda ───────────────────────────────── */}
      <SectionCard
        title="Today's Agenda"
        subtitle="Click any task to mark it complete"
        icon={CalendarDays}
        badge={totalToday > 0 ? (
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-full"
            style={{ background: '#00685f15', color: '#00685f' }}
          >
            {completedToday}/{totalToday} done
          </span>
        ) : undefined}
      >
        <DailyAgendaCard tasks={todaysTasks} onTaskComplete={refresh} />
      </SectionCard>

      {/* ── Row 3: Activity Chart + Subject Breakdown ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Weekly bar chart */}
        <SectionCard
          title="Planned vs. Completed"
          subtitle="Your study activity over the last 7 days"
          icon={TrendingUp}
          className="lg:col-span-3"
          badge={
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#00685f' }} />
                <span className="text-[11px] font-medium text-[#6d7a77]">Planned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#fea619' }} />
                <span className="text-[11px] font-medium text-[#6d7a77]">Completed</span>
              </div>
            </div>
          }
        >
          <ActivityGraph data={weeklyActivity} />
        </SectionCard>

        {/* Subject breakdown */}
        <SectionCard
          title="Subject Progress"
          subtitle="Needs attention → on track"
          icon={BookOpen}
          className="lg:col-span-2"
        >
          <SubjectBreakdownCard subjects={subjectProgress} />
        </SectionCard>
      </div>
    </div>
  )
}
