'use client'

import { useState } from 'react'
import { TaskWithSubject } from '@/types/planner.types'
import { format, parseISO } from 'date-fns'
import { CheckCircle2, Circle, Clock, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface DailyAgendaCardProps {
  tasks: TaskWithSubject[]
  onTaskComplete: () => void
}

function AgendaTask({ task, onComplete }: { task: TaskWithSubject; onComplete: (id: string) => void }) {
  const [pending, setPending] = useState(false)
  const isDone = task.status === 'completed'

  const handleToggle = async () => {
    if (isDone || pending) return
    setPending(true)
    onComplete(task.id)
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200',
        isDone
          ? 'bg-muted/30 opacity-60'
          : 'hover:bg-muted/40 cursor-pointer active:scale-[0.99]'
      )}
      onClick={!isDone ? handleToggle : undefined}
    >
      {/* Completion toggle */}
      <button
        className="shrink-0 transition-transform hover:scale-110"
        disabled={isDone || pending}
        tabIndex={-1}
      >
        {isDone ? (
          <CheckCircle2 className="w-5 h-5 text-primary" />
        ) : (
          <Circle
            className={cn(
              'w-5 h-5 text-muted-foreground/50 group-hover:text-primary/60 transition-colors',
              pending && 'animate-pulse text-primary/40'
            )}
          />
        )}
      </button>

      {/* Subject color dot */}
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: task.subjects?.color || '#94a3b8' }}
      />

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold truncate', isDone && 'line-through text-muted-foreground')}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground font-medium uppercase truncate">
            {task.subjects?.name}
          </span>
          {task.due_date && (
            <>
              <span className="text-[10px] text-muted-foreground/40">•</span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(parseISO(task.due_date), 'h:mm a')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Duration badge */}
      <span
        className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: `${task.subjects?.color || '#94a3b8'}18`,
          color: task.subjects?.color || '#64748b',
        }}
      >
        {task.duration_minutes}m
      </span>
    </div>
  )
}

export function DailyAgendaCard({ tasks, onTaskComplete }: DailyAgendaCardProps) {
  const supabase = createClient()

  const handleComplete = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId)

    if (error) {
      toast.error('Failed to mark task complete')
    } else {
      toast.success('Task completed! 🎉')
      onTaskComplete()
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <div className="p-4 rounded-2xl bg-primary/10">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Nothing scheduled today</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ready to plan your day?
          </p>
        </div>
        <Link
          href="/planner"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1"
        >
          Open Planner <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/40">
      {tasks.map(task => (
        <AgendaTask key={task.id} task={task} onComplete={handleComplete} />
      ))}
    </div>
  )
}
