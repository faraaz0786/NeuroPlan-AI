'use client'

import { usePlannerStore, PlannerViewMode } from "@/store/usePlannerStore"
import { motion } from "framer-motion"
import { LayoutDashboard, ListTodo, Plus } from "lucide-react"
import { CreatePlanModal } from "./CreatePlanModal"
import { useState } from "react"

export function PlannerHeader() {
  const { view, setView } = usePlannerStore()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const tabs: { id: PlannerViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'kanban', label: 'Kanban', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <ListTodo className="w-4 h-4" /> },
  ]

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: '#00685f' }}>
            WORKSPACE
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#191c1e]">Study Planner</h1>
          <p className="text-sm text-[#3d4947] mt-1">Manage and optimize your daily schedule.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Segmented view toggle */}
          <div
            className="flex p-1 rounded-xl self-start"
            style={{ background: '#f2f4f6' }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors outline-none"
                style={{
                  color: view === tab.id ? '#00685f' : '#3d4947',
                }}
              >
                {view === tab.id && (
                  <motion.div
                    layoutId="planner-view-pill"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{ border: '1px solid #e2e8f0' }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Create New Plan CTA */}
          <button
            onClick={() => setIsModalOpen(true)}
            id="create-plan-btn"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg active:scale-95 hover:opacity-90 transition-all"
            style={{
              background: 'linear-gradient(135deg, #00685f, #008378)',
              boxShadow: '0 4px 16px rgba(0,104,95,0.25)',
            }}
          >
            <Plus className="w-4 h-4" />
            Create New Plan
          </button>
        </div>
      </div>

      <CreatePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
