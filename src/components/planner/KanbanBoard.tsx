'use client'

import { useState } from "react"
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragEndEvent 
} from "@dnd-kit/core"
import { usePlannerStore } from "@/store/usePlannerStore"
import { useTasks } from "@/hooks/useTasks"
import { KanbanColumn } from "./KanbanColumn"
import { TaskCard } from "./TaskCard"
import { TaskStatus, TaskWithSubject } from "@/types/planner.types"

const COLUMNS: { id: TaskStatus; title: string; colorClass: string }[] = [
  { id: "pending", title: "To Do", colorClass: "bg-blue-500/10 text-blue-700 border-blue-200" },
  { id: "completed", title: "Completed", colorClass: "bg-green-500/10 text-green-700 border-green-200" },
  { id: "missed", title: "Missed", colorClass: "bg-red-500/10 text-red-700 border-red-200" },
]

export function KanbanBoard() {
  const { tasks } = usePlannerStore()
  const { moveTaskStatus } = useTasks()
  
  const [activeTask, setActiveTask] = useState<TaskWithSubject | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement before drag (fixes click events)
      },
    })
  )

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
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === "Task"
    const isOverColumn = over.data.current?.type === "Column"
    const isOverTask = over.data.current?.type === "Task"

    if (!isActiveTask) return

    // Dropping a Task over a Column explicitly
    if (isOverColumn) {
      const newStatus = over.data.current?.status as TaskStatus
      moveTaskStatus(activeId as string, newStatus)
      return
    }

    // Dropping a Task over another Task implicitly joins that column
    if (isOverTask) {
      const newStatus = over.data.current?.task.status as TaskStatus
      moveTaskStatus(activeId as string, newStatus)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible gap-6 h-full pb-4 -mx-4 px-4 md:px-0 md:mx-0">
        {COLUMNS.map((col) => (
          <div key={col.id} className="min-w-[85vw] md:min-w-0 snap-center h-full flex flex-col">
            <KanbanColumn
              id={col.id}
              title={col.title}
              colorClass={col.colorClass}
              tasks={tasks.filter((t) => t.status === col.id)}
            />
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
