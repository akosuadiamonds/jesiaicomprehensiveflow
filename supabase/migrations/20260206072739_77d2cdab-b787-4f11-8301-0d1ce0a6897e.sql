-- Create table for student coins/rewards
CREATE TABLE public.student_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  coins INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Create table for coin transactions history
CREATE TABLE public.coin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earn' or 'spend'
  source TEXT NOT NULL, -- 'login_streak', 'lesson_complete', 'quiz_complete', 'class_participation', etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for student practice sessions
CREATE TABLE public.practice_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'quick', -- 'quick', 'mock', 'timed_exam'
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  difficulty_level TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  questions_data JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for student learning progress
CREATE TABLE public.learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  total_lessons INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject, topic)
);

-- Enable RLS on all tables
ALTER TABLE public.student_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_coins
CREATE POLICY "Students can view their own coins"
ON public.student_coins FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own coins record"
ON public.student_coins FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own coins"
ON public.student_coins FOR UPDATE
USING (auth.uid() = student_id);

-- RLS policies for coin_transactions
CREATE POLICY "Students can view their own transactions"
ON public.coin_transactions FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own transactions"
ON public.coin_transactions FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- RLS policies for practice_sessions
CREATE POLICY "Students can view their own practice sessions"
ON public.practice_sessions FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can create their own practice sessions"
ON public.practice_sessions FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own practice sessions"
ON public.practice_sessions FOR UPDATE
USING (auth.uid() = student_id);

-- RLS policies for learning_progress
CREATE POLICY "Students can view their own learning progress"
ON public.learning_progress FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own learning progress"
ON public.learning_progress FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own learning progress"
ON public.learning_progress FOR UPDATE
USING (auth.uid() = student_id);

-- Create triggers for updated_at
CREATE TRIGGER update_student_coins_updated_at
  BEFORE UPDATE ON public.student_coins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();