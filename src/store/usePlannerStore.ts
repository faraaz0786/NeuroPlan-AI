import { create } from 'zustand'
import { TaskWithSubject, TaskStatus } from '@/types/planner.types'

export type PlannerViewMode = 'kanban' | 'timeline'

interface PlannerState {
  view: PlannerViewMode
  setView: (view: PlannerViewMode) => void
  tasks: TaskWithSubject[]
  setTasks: (tasks: TaskWithSubject[]) => void
  updateTaskStatus: (id: string, status: TaskStatus) => void
  updateTaskDate: (id: string, newDate: string) => void
  revertTask: (original: TaskWithSubject) => void
}

export const usePlannerStore = create<PlannerState>((set) => ({
  view: 'kanban',
  setView: (view) => set({ view }),
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  updateTaskStatus: (id, status) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === id ? { ...t, status } : t)
  })),
  updateTaskDate: (id, newDate) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === id ? { ...t, due_date: newDate } : t)
  })),
  revertTask: (original) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === original.id ? original : t)
  }))
}))
