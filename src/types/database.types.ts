export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          difficulty: 'easy' | 'medium' | 'hard'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          difficulty?: 'easy' | 'medium' | 'hard'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          difficulty?: 'easy' | 'medium' | 'hard'
          created_at?: string
        }
        Relationships: []
      }
      study_plans: {
        Row: {
          id: string
          user_id: string
          title: string
          is_ai_generated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          is_ai_generated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          is_ai_generated?: boolean
          created_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          plan_id: string | null
          subject_id: string
          user_id: string
          title: string
          description: string | null
          due_date: string | null
          duration_minutes: number
          status: 'pending' | 'completed' | 'missed'
          created_at: string
        }
        Insert: {
          id?: string
          plan_id?: string | null
          subject_id: string
          user_id: string
          title: string
          description?: string | null
          due_date?: string | null
          duration_minutes: number
          status?: 'pending' | 'completed' | 'missed'
          created_at?: string
        }
        Update: {
          id?: string
          plan_id?: string | null
          subject_id?: string
          user_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          duration_minutes?: number
          status?: 'pending' | 'completed' | 'missed'
          created_at?: string
        }
        Relationships: []
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          date: string
          total_minutes_studied: number
          tasks_completed: number
          tasks_missed: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          total_minutes_studied?: number
          tasks_completed?: number
          tasks_missed?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          total_minutes_studied?: number
          tasks_completed?: number
          tasks_missed?: number
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'reminder' | 'alert' | 'system'
          is_read: boolean
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'reminder' | 'alert' | 'system'
          is_read?: boolean
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'reminder' | 'alert' | 'system'
          is_read?: boolean
          reference_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
