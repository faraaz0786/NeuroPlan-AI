'use client'

import { useMemo, useState } from "react"
import { 
  DndContext, DragOverlay, closestCorners, PointerSensor, 
  useSensor, useSensors, DragStartEvent, DragEndEvent, useDroppable 
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { usePlannerStore } from "@/store/usePlannerStore"
import { useTasks } from "@/hooks/useTasks"
import { TaskWithSubject } from "@/types/planner.types"
import { SortableTask } from "./SortableTask"
import { TaskCard } from "./TaskCard"
import { startOfDay, format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

interface TimelineGroupProps {
  dateStr: string
  tasks: TaskWithSubject[]
}

function TimelineGroup({ dateStr, tasks }: TimelineGroupProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `timeline-${dateStr}`,
    data: {
      type: "DateGroup",
      dateStr,
    },
  })

  const taskIds = tasks.map(t => t.id)
  const isPast = new Date(dateStr) < startOfDay(new Date())
  const todayStr = startOfDay(new Date()).toISOString()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold text-lg text-foreground">
          {dateStr === todayStr ? "Today" : format(parseISO(dateStr), 'EEEE, MMMM do')}
        </h3>
        {isPast && <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-muted text-muted-foreground">Past</span>}
        <div className="h-px bg-border/50 flex-1 ml-4" />
      </div>

      <div 
        ref={setNodeRef} 
        className={cn(
          "min-h-[100px] rounded-2xl p-2 transition-colors border border-transparent",
          isOver ? "bg-muted/30 border-border/50" : ""
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => (
              <SortableTask key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-16 rounded-xl flex items-center text-sm text-muted-foreground/40 italic">
            No tasks scheduled
          </div>
        )}
      </div>
    </div>
  )
}

export function TimelineView() {
  const { tasks } = usePlannerStore()
  const { rescheduleTask } = useTasks()
  const [activeTask, setActiveTask] = useState<TaskWithSubject | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  // Group tasks by Day
  const groupedTasks = useMemo(() => {
    const groups: Record<string, TaskWithSubject[]> = {}
    
    tasks.forEach(task => {
      // Fallback empty allocations to "Unscheduled" today
      const dSafe = task.due_date ? parseISO(task.due_date) : new Date()
      const dayRaw = startOfDay(dSafe).toISOString()
      
      if (!groups[dayRaw]) groups[dayRaw] = []
      groups[dayRaw].push(task)
    })
    
    // Sort keys chronologically
    const sortedKeys = Object.keys(groups).sort((a,b) => new Date(a).getTime() - new Date(b).getTime())
    
    return sortedKeys.map(key => ({
      dateStr: key,
      tasks: groups[key]
    }))
  }, [tasks])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.type === "Task") {
      setActiveTask(active.data.current.task)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const isActiveTask = active.data.current?.type === "Task"
    
    if (!isActiveTask) return

    const isOverGroup = over.data.current?.type === "DateGroup"
    const isOverTask = over.data.current?.type === "Task"

    if (isOverGroup) {
      const newDateStr = over.data.current?.dateStr as string
      rescheduleTask(activeId as string, newDateStr)
      return
    }

    if (isOverTask) {
      // Find the date of the task we hovered over
      const overTaskSafeDate = over.data.current?.task.due_date
      if (overTaskSafeDate) {
         const newDateStr = startOfDay(parseISO(overTaskSafeDate)).toISOString()
         rescheduleTask(activeId as string, newDateStr)
      }
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-10 pb-20">
        {groupedTasks.map(group => (
          <TimelineGroup key={group.dateStr} dateStr={group.dateStr} tasks={group.tasks} />
        ))}
        {groupedTasks.length === 0 && (
          <div className="py-20 text-center text-muted-foreground w-full">
            No scheduled timeline found. Let the AI generate your plan first.
          </div>
        )}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
