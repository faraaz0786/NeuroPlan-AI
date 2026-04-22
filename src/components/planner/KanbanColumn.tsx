import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Inbox } from "lucide-react"
import { TaskWithSubject, TaskStatus } from "@/types/planner.types"
import { SortableTask } from "./SortableTask"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
  id: TaskStatus
  title: string
  colorClass: string
  tasks: TaskWithSubject[]
}

const COLUMN_CONFIG: Record<TaskStatus, { accent: string; dotColor: string; countBg: string }> = {
  pending:   { accent: '#00685f', dotColor: '#00685f', countBg: '#00685f15' },
  completed: { accent: '#008378', dotColor: '#008378', countBg: '#00837815' },
  missed:    { accent: '#b61722', dotColor: '#b61722', countBg: '#b6172215' },
}

export function KanbanColumn({ id, title, colorClass, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Column",
      status: id,
    },
  })

  const config = COLUMN_CONFIG[id] || COLUMN_CONFIG.pending
  const taskIds = tasks.map((t) => t.id)

  return (
    <div
      className={cn(
        "flex flex-col h-[70vh] rounded-2xl p-4 transition-colors",
        isOver ? "bg-[#f2f4f6]" : "bg-[#f7f9fb]",
        "border border-[#e2e8f0]"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: config.dotColor }}
          />
          <h3 className="font-bold text-[14px] text-[#191c1e]">{title}</h3>
          {/* In Progress live dot */}
          {id === 'pending' && tasks.length > 0 && (
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#fea619' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#fea619' }} />
            </span>
          )}
        </div>
        <span
          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
          style={{ background: config.countBg, color: config.accent }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Droppable zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden space-y-3 p-1 rounded-xl transition-colors no-scrollbar",
          isOver ? "ring-2 ring-offset-1 ring-[#00685f]/30" : ""
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-xl gap-2"
            style={{ borderColor: '#e2e8f0', background: '#f7f9fb' }}
          >
            <Inbox className="w-5 h-5 opacity-30" style={{ color: '#6d7a77' }} />
            <span className="text-[12px] font-medium text-[#bcc9c6] select-none">Drop tasks here</span>
          </div>
        )}
      </div>
    </div>
  )
}
