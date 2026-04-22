import { Database } from './database.types'

// Core Entities
export type User = Database['public']['Tables']['users']['Row']
export type Subject = Database['public']['Tables']['subjects']['Row']
export type StudyPlan = Database['public']['Tables']['study_plans']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Analytics = Database['public']['Tables']['analytics']['Row']

// Insert Payloads (Omit ID and defaults handled by DB)
export type SubjectInsert = Database['public']['Tables']['subjects']['Insert']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type StudyPlanInsert = Database['public']['Tables']['study_plans']['Insert']

// Update Payloads
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

// Specific Application Types mapping directly to the pure DB schema
export type TaskStatus = Task['status']
export type SubjectDifficulty = Subject['difficulty']

export type TaskWithSubject = Task & {
  subjects: Pick<Subject, 'id' | 'name' | 'color' | 'difficulty'> | null
}
