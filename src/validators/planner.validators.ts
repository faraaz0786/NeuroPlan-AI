import { z } from 'zod'

export const SubjectInputSchema = z.object({
  id: z.string().uuid().optional(), // If already exists
  name: z.string().min(1, "Subject name is required"),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  priority: z.number().int().min(1).max(10),
  color: z.string().optional(),
})

export type SubjectInput = z.infer<typeof SubjectInputSchema>

export const CreateStudyPlanInputSchema = z.object({
  title: z.string().min(1, "Plan title is required"),
  start_date: z.string().datetime({ offset: true }), // Strict ISO date
  end_date: z.string().datetime({ offset: true }),
  hours_per_day: z.number().min(0.5, "Must allocate at least 30 minutes daily").max(16, "Cannot exceed 16 hours daily"),
  study_days: z.array(z.number().int().min(0).max(6)).min(1, "Select at least one study day"),
  // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  subjects: z.array(SubjectInputSchema).min(1, "At least one subject is required")
}).refine(data => {
  const start = new Date(data.start_date)
  const end = new Date(data.end_date)
  return end > start
}, {
  message: "End date must be sequentially after start date",
  path: ["end_date"]
})

export type CreateStudyPlanInput = z.infer<typeof CreateStudyPlanInputSchema>

// The AI outputs this precisely
export const AITaskSchema = z.object({
  title: z.string().default("Study Session"),
  subject: z.string(),
  duration: z.number(),
  priority: z.number(),
})

export const AIDayScheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  tasks: z.array(AITaskSchema)
})

export const AIGeneratedPlanSchema = z.object({
  schedule: z.array(AIDayScheduleSchema)
})

export type AITask = z.infer<typeof AITaskSchema>
export type AIGeneratedPlan = z.infer<typeof AIGeneratedPlanSchema>
