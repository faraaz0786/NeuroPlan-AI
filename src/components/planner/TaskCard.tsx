import { TaskWithSubject } from "@/types/planner.types"
import { Clock, Calendar, CheckCircle2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: TaskWithSubject
  isDragging?: boolean
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   '#008378',
  medium: '#fea619',
  hard:   '#b61722',
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const formattedTime = task.due_date ? format(parseISO(task.due_date), "MMM d, h:mm a") : "Unscheduled"
  const isCompleted = task.status === 'completed'
  const subjectColor = task.subjects?.color || '#00685f'

  return (
    <div
      className={cn(
        "bg-white rounded-xl border transition-all duration-200 ease-out select-none group relative overflow-hidden",
        isDragging
          ? "shadow-2xl ring-2 ring-[#00685f]/30 scale-[1.02] z-50 cursor-grabbing"
          : "shadow-sm hover:shadow-md cursor-grab active:scale-[0.98] border-[#e2e8f0] hover:border-[#bcc9c6]"
      )}
      style={{
        borderLeft: `4px solid ${subjectColor}`,
        opacity: isCompleted ? 0.7 : 1,
      }}
    >
      <div className="p-4 flex flex-col gap-3">
        {/* Title row */}
        <div className="flex justify-between items-start gap-2">
          <h4 className={cn(
            "font-semibold text-[14px] leading-tight text-[#191c1e] line-clamp-2",
            isCompleted && "line-through text-[#6d7a77]"
          )}>
            {task.title}
          </h4>
          {isCompleted && (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#008378' }} />
          )}
        </div>

        {/* Subject pill */}
        {task.subjects && (
          <div className="flex items-center gap-1.5">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{
                background: `${subjectColor}15`,
                color: subjectColor,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: subjectColor }} />
              <span className="truncate max-w-[100px]">{task.subjects.name}</span>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-3 text-[12px] font-medium text-[#6d7a77]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: '#fea61915', color: '#855300' }}
            >
              {task.duration_minutes}m
            </span>
          </div>
          <div className="flex items-center gap-1.5 group-hover:text-[#3d4947] transition-colors">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
