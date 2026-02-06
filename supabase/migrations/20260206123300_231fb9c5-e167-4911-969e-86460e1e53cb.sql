
-- Create table for saved exams
CREATE TABLE public.saved_exams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL,
  school_name text NOT NULL,
  exam_name text NOT NULL,
  subject text NOT NULL,
  class text NOT NULL,
  level text NOT NULL,
  duration text NOT NULL,
  total_marks integer NOT NULL DEFAULT 0,
  section_a jsonb NOT NULL DEFAULT '[]'::jsonb,
  section_b jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own exams"
ON public.saved_exams FOR SELECT
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create exams"
ON public.saved_exams FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own exams"
ON public.saved_exams FOR UPDATE
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own exams"
ON public.saved_exams FOR DELETE
USING (auth.uid() = teacher_id);

CREATE TRIGGER update_saved_exams_updated_at
BEFORE UPDATE ON public.saved_exams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
