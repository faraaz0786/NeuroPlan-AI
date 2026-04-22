'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, X, Sparkles, Loader2, Calendar, Clock, BookOpen, CalendarDays } from 'lucide-react'
import { CreateStudyPlanInputSchema, CreateStudyPlanInput } from '@/validators/planner.validators'
import { createStudyPlanAction } from '@/actions/planner.actions'
import { toast } from 'sonner'
import { useTasks } from '@/hooks/useTasks'

interface CreatePlanModalProps {
  isOpen: boolean
  onClose: () => void
}

const DIFFICULTY_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  easy:   { label: 'EASY',   bg: '#00837815', color: '#008378' },
  medium: { label: 'MED',    bg: '#fea61920', color: '#855300' },
  hard:   { label: 'HIGH',   bg: '#b6172215', color: '#b61722' },
}

const DAY_LABELS = [
  { key: 0, short: 'S', full: 'Sun' },
  { key: 1, short: 'M', full: 'Mon' },
  { key: 2, short: 'T', full: 'Tue' },
  { key: 3, short: 'W', full: 'Wed' },
  { key: 4, short: 'T', full: 'Thu' },
  { key: 5, short: 'F', full: 'Fri' },
  { key: 6, short: 'S', full: 'Sat' },
]

export function CreatePlanModal({ isOpen, onClose }: CreatePlanModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { fetchTasks } = useTasks()

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<CreateStudyPlanInput>({
    resolver: zodResolver(CreateStudyPlanInputSchema),
    defaultValues: {
      title: '',
      hours_per_day: 4,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      study_days: [1, 2, 3, 4, 5], // Mon-Fri default
      subjects: [{ name: '', difficulty: 'medium', priority: 5 }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subjects'
  })

  const hoursPerDay = watch('hours_per_day') ?? 4
  const studyDays = watch('study_days') ?? [1, 2, 3, 4, 5]

  const toggleDay = (day: number) => {
    const current = studyDays
    if (current.includes(day)) {
      // Don't allow deselecting if it's the last one
      if (current.length <= 1) return
      setValue('study_days', current.filter(d => d !== day), { shouldValidate: true })
    } else {
      setValue('study_days', [...current, day].sort(), { shouldValidate: true })
    }
  }

  const onSubmit = async (data: CreateStudyPlanInput) => {
    setIsSubmitting(true)
    try {
      const result = await createStudyPlanAction(data)
      if (result.success) {
        toast.success(`Plan created! Generated ${result.data?.tasksCreated} tasks via AI.`)
        await fetchTasks()
        onClose()
        reset()
      } else {
        toast.error(result.error || 'Failed to create plan')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white z-[51] overflow-hidden"
            style={{ borderRadius: '1.5rem', boxShadow: '0 24px 60px rgba(15,23,42,0.18)' }}
          >
            {/* ── Modal Header ──────────────────────────── */}
            <div
              className="flex items-center justify-between px-7 py-5 border-b border-[#f2f4f6]"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #00685f, #008378)' }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-[#191c1e]">Create Smart Study Plan</h2>
                  <p className="text-[12px] text-[#6d7a77] mt-0.5">AI will optimize your schedule based on subjects & difficulty.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#6d7a77] hover:bg-[#f2f4f6] hover:text-[#191c1e] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Form Body ─────────────────────────────── */}
            <form
              id="create-plan-form"
              onSubmit={handleSubmit(onSubmit)}
              className="px-7 py-6 space-y-6 max-h-[65vh] overflow-y-auto no-scrollbar"
            >
              {/* Plan Title */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3d4947] mb-2">
                  Plan Title
                </label>
                <div className="input-underline">
                  <input
                    placeholder="e.g., Final Exams Prep / Semester Start"
                    {...register('title')}
                    className="w-full px-4 py-3 bg-[#f2f4f6] rounded-lg text-sm text-[#191c1e] placeholder:text-[#bcc9c6] outline-none transition-all focus:bg-white"
                  />
                </div>
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#3d4947] mb-2">
                    <Calendar className="w-3.5 h-3.5 text-[#6d7a77]" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value).toISOString() : ''
                      setValue('start_date', date, { shouldValidate: true })
                    }}
                    className="w-full px-4 py-3 bg-[#f2f4f6] rounded-lg text-sm text-[#191c1e] outline-none transition-all focus:bg-white"
                  />
                  {errors.start_date && <p className="text-xs text-red-500 mt-1">{errors.start_date.message}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#3d4947] mb-2">
                    <Calendar className="w-3.5 h-3.5 text-[#6d7a77]" />
                    End Date
                  </label>
                  <input
                    type="date"
                    defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value).toISOString() : ''
                      setValue('end_date', date, { shouldValidate: true })
                    }}
                    className="w-full px-4 py-3 bg-[#f2f4f6] rounded-lg text-sm text-[#191c1e] outline-none transition-all focus:bg-white"
                  />
                  {errors.end_date && <p className="text-xs text-red-500 mt-1">{errors.end_date.message}</p>}
                </div>
              </div>

              {/* ── Study Days Picker ─────────────────────── */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#3d4947] mb-3">
                  <CalendarDays className="w-3.5 h-3.5 text-[#6d7a77]" />
                  Study Days
                </label>
                <div className="flex items-center gap-2">
                  {DAY_LABELS.map((day) => {
                    const isSelected = studyDays.includes(day.key)
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        title={day.full}
                        className="relative w-10 h-10 rounded-full text-sm font-bold transition-all duration-200 flex items-center justify-center shrink-0"
                        style={{
                          background: isSelected
                            ? 'linear-gradient(135deg, #00685f, #008378)'
                            : '#f2f4f6',
                          color: isSelected ? '#ffffff' : '#6d7a77',
                          border: isSelected ? '2px solid #00685f' : '2px solid #e2e8f0',
                          boxShadow: isSelected ? '0 2px 8px rgba(0,104,95,0.25)' : 'none',
                          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        {day.short}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[10px] text-[#6d7a77] mt-2">
                  {studyDays.length === 7
                    ? 'Every day — No rest days!'
                    : `${studyDays.length} day${studyDays.length !== 1 ? 's' : ''} selected · Tasks will only be scheduled on these days`}
                </p>
                {errors.study_days && <p className="text-xs text-red-500 mt-1">{errors.study_days.message}</p>}
              </div>

              {/* Daily Intensity Slider */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#3d4947] mb-3">
                  <Clock className="w-3.5 h-3.5 text-[#6d7a77]" />
                  Daily Study Intensity — <span className="font-extrabold" style={{ color: '#00685f' }}>{hoursPerDay}h / day</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  {...register('hours_per_day', { valueAsNumber: true })}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 text-[10px] font-bold text-[#bcc9c6] uppercase tracking-wider">
                  <span>Light</span>
                  <span>Moderate</span>
                  <span>Intense</span>
                </div>
                {errors.hours_per_day && <p className="text-xs text-red-500 mt-1">{errors.hours_per_day.message}</p>}
              </div>

              {/* Subjects Section */}
              <div className="space-y-4 pt-4 border-t border-[#f2f4f6]">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[13px] font-bold text-[#191c1e]">
                    <BookOpen className="w-4 h-4" style={{ color: '#00685f' }} />
                    Subjects to Master
                  </label>
                  <button
                    type="button"
                    onClick={() => append({ name: '', difficulty: 'medium', priority: 5 })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors hover:opacity-80"
                    style={{ background: '#00685f15', color: '#00685f' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Subject
                  </button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const difficulty = watch(`subjects.${index}.difficulty`) as string
                    const diffStyle = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.medium

                    return (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 p-4 rounded-xl relative"
                        style={{ background: '#f7f9fb', border: '1px solid #e2e8f0' }}
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Name */}
                          <div className="md:col-span-1">
                            <label className="text-[10px] uppercase font-bold text-[#6d7a77] tracking-wider mb-1.5 block">Subject</label>
                            <input
                              placeholder="e.g., Physics"
                              {...register(`subjects.${index}.name`)}
                              className="w-full px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-lg text-sm text-[#191c1e] placeholder:text-[#bcc9c6] outline-none focus:border-[#00685f] transition-colors"
                            />
                          </div>
                          {/* Difficulty */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[10px] uppercase font-bold text-[#6d7a77] tracking-wider">Difficulty</label>
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: diffStyle.bg, color: diffStyle.color }}
                              >
                                {diffStyle.label}
                              </span>
                            </div>
                            <select
                              className="w-full h-9 rounded-lg border border-[#e2e8f0] bg-white px-2.5 text-sm text-[#191c1e] outline-none focus:border-[#00685f] transition-colors"
                              {...register(`subjects.${index}.difficulty`)}
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                          {/* Priority */}
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[#6d7a77] tracking-wider mb-1.5 block">Priority (1–10)</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              {...register(`subjects.${index}.priority`, { valueAsNumber: true })}
                              className="w-full px-3 py-2.5 bg-white border border-[#e2e8f0] rounded-lg text-sm text-[#191c1e] outline-none focus:border-[#00685f] transition-colors"
                            />
                          </div>
                        </div>

                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="mt-6 w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </motion.div>
                    )
                  })}
                  {errors.subjects && <p className="text-xs text-red-500">{errors.subjects.message}</p>}
                </div>
              </div>
            </form>

            {/* ── Modal Footer ──────────────────────────── */}
            <div
              className="flex items-center justify-end gap-3 px-7 py-5 border-t border-[#f2f4f6]"
              style={{ background: '#f7f9fb' }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#3d4947] hover:bg-[#e6e8ea] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-plan-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg active:scale-95 hover:opacity-90 transition-all disabled:opacity-60 min-w-[160px] justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00685f, #008378)',
                  boxShadow: '0 4px 16px rgba(0,104,95,0.25)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Optimizing Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Plan ✨
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
