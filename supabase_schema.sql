-- NeuroPlan AI Supabase Schema

-- 1. Create subjects table
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#E5E7EB',
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create study_plans table
CREATE TABLE study_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES study_plans(id) ON DELETE SET NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'missed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create analytics table
CREATE TABLE analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_minutes_studied INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_missed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);

-- Enable RLS (Row Level Security) on all tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create Policies for subjects
CREATE POLICY "Users can insert their own subjects."
ON subjects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own subjects."
ON subjects FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects."
ON subjects FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects."
ON subjects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create Policies for study_plans
CREATE POLICY "Users can insert their own study_plans."
ON study_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own study_plans."
ON study_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own study_plans."
ON study_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study_plans."
ON study_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create Policies for tasks
CREATE POLICY "Users can insert their own tasks."
ON tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks."
ON tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks."
ON tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks."
ON tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create Policies for analytics
CREATE POLICY "Users can insert their own analytics."
ON analytics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics."
ON analytics FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics."
ON analytics FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics."
ON analytics FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 5. Notifications Table
-- ============================================================
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('reminder', 'alert', 'system')) NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  reference_id UUID, -- optional: task_id this notification refers to
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- prevent duplicate reminders for the same task on the same day
  UNIQUE (user_id, type, reference_id)
);

-- Performance index: most queries filter by user + read state
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies (users only see / mutate their own rows)
CREATE POLICY "Users can insert their own notifications."
ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications."
ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications."
ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications."
ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
