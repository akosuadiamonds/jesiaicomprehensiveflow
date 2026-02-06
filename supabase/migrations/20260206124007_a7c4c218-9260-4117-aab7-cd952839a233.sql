
-- Create table for saved lesson plans
CREATE TABLE public.saved_lesson_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL,
  subject text NOT NULL,
  class text NOT NULL,
  class_size integer NOT NULL DEFAULT 30,
  strand text NOT NULL DEFAULT '',
  sub_strand text NOT NULL DEFAULT '',
  content_standard text NOT NULL DEFAULT '',
  indicator text NOT NULL DEFAULT '',
  performance_indicator text NOT NULL DEFAULT '',
  core_competencies text NOT NULL DEFAULT '',
  teaching_resources text NOT NULL DEFAULT '',
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  references_text text NOT NULL DEFAULT '',
  phases jsonb NOT NULL DEFAULT '[]'::jsonb,
  lesson_note text NOT NULL DEFAULT '',
  duration integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own lesson plans"
ON public.saved_lesson_plans FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create lesson plans"
ON public.saved_lesson_plans FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own lesson plans"
ON public.saved_lesson_plans FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own lesson plans"
ON public.saved_lesson_plans FOR DELETE USING (auth.uid() = teacher_id);

CREATE TRIGGER update_saved_lesson_plans_updated_at
BEFORE UPDATE ON public.saved_lesson_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for saved quizzes/tests
CREATE TABLE public.saved_quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'quiz',
  title text NOT NULL,
  subject text NOT NULL,
  class text NOT NULL,
  level text NOT NULL DEFAULT '',
  duration integer NOT NULL DEFAULT 15,
  question_formats text[] NOT NULL DEFAULT '{mcq}'::text[],
  dok_level integer NOT NULL DEFAULT 1,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_marks integer NOT NULL DEFAULT 0,
  is_locked boolean NOT NULL DEFAULT false,
  access_code text NOT NULL DEFAULT '',
  assigned_classroom_id uuid,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own quizzes"
ON public.saved_quizzes FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create quizzes"
ON public.saved_quizzes FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own quizzes"
ON public.saved_quizzes FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own quizzes"
ON public.saved_quizzes FOR DELETE USING (auth.uid() = teacher_id);

CREATE TRIGGER update_saved_quizzes_updated_at
BEFORE UPDATE ON public.saved_quizzes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
