'use client'

import { PlannerHeader } from "@/components/planner/PlannerHeader"
import { KanbanBoard } from "@/components/planner/KanbanBoard"
import { TimelineView } from "@/components/planner/TimelineView"
import { usePlannerStore } from "@/store/usePlannerStore"
import { useTasks } from "@/hooks/useTasks"
import { PlannerSkeleton } from "@/components/planner/PlannerSkeleton"

export default function PlannerPage() {
  const { view } = usePlannerStore()
  const { isLoading } = useTasks() // This hydrates the global Zustand store automatically

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto px-4 py-8">
      <PlannerHeader />
      
      {isLoading ? (
        <div className="flex-1 overflow-hidden">
          <PlannerSkeleton />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          {view === 'kanban' ? <KanbanBoard /> : <TimelineView />}
        </div>
      )}
    </div>
  )
}
