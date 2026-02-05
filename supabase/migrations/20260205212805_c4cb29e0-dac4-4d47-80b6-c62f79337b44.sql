-- Create classroom type enum
CREATE TYPE public.classroom_type AS ENUM ('school', 'private');

-- Create classrooms table
CREATE TABLE public.classrooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  classroom_type public.classroom_type NOT NULL DEFAULT 'school',
  invite_code TEXT NOT NULL UNIQUE,
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'GHS',
  max_students INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classroom_students junction table
CREATE TABLE public.classroom_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  subscription_status TEXT DEFAULT 'active',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(classroom_id, student_id)
);

-- Create classroom_resources table for shared content
CREATE TABLE public.classroom_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'lesson_plan', 'test', 'quiz', 'announcement', 'material'
  content JSONB,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create classroom_announcements table
CREATE TABLE public.classroom_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_announcements ENABLE ROW LEVEL SECURITY;

-- Function to generate unique invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Trigger to auto-generate invite code
CREATE OR REPLACE FUNCTION public.set_classroom_invite_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.invite_code IS NULL OR NEW.invite_code = '' THEN
    NEW.invite_code := public.generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_invite_code_trigger
BEFORE INSERT ON public.classrooms
FOR EACH ROW
EXECUTE FUNCTION public.set_classroom_invite_code();

-- Trigger for updated_at
CREATE TRIGGER update_classrooms_updated_at
BEFORE UPDATE ON public.classrooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classroom_resources_updated_at
BEFORE UPDATE ON public.classroom_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for classrooms
CREATE POLICY "Teachers can view their own classrooms"
ON public.classrooms FOR SELECT
USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view classrooms they joined"
ON public.classrooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classroom_students
    WHERE classroom_students.classroom_id = id
    AND classroom_students.student_id = auth.uid()
    AND classroom_students.is_active = true
  )
);

CREATE POLICY "Teachers can create classrooms"
ON public.classrooms FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their classrooms"
ON public.classrooms FOR UPDATE
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their classrooms"
ON public.classrooms FOR DELETE
USING (auth.uid() = teacher_id);

-- RLS Policies for classroom_students
CREATE POLICY "Teachers can view students in their classrooms"
ON public.classroom_students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE classrooms.id = classroom_id
    AND classrooms.teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own enrollments"
ON public.classroom_students FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can join classrooms"
ON public.classroom_students FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can manage students in their classrooms"
ON public.classroom_students FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE classrooms.id = classroom_id
    AND classrooms.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can remove students from their classrooms"
ON public.classroom_students FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE classrooms.id = classroom_id
    AND classrooms.teacher_id = auth.uid()
  )
);

-- RLS Policies for classroom_resources
CREATE POLICY "Teachers can manage their classroom resources"
ON public.classroom_resources FOR ALL
USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view published resources in their classrooms"
ON public.classroom_resources FOR SELECT
USING (
  is_published = true AND
  EXISTS (
    SELECT 1 FROM public.classroom_students
    WHERE classroom_students.classroom_id = classroom_resources.classroom_id
    AND classroom_students.student_id = auth.uid()
    AND classroom_students.is_active = true
  )
);

-- RLS Policies for classroom_announcements
CREATE POLICY "Teachers can manage announcements in their classrooms"
ON public.classroom_announcements FOR ALL
USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view announcements in their classrooms"
ON public.classroom_announcements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classroom_students
    WHERE classroom_students.classroom_id = classroom_announcements.classroom_id
    AND classroom_students.student_id = auth.uid()
    AND classroom_students.is_active = true
  )
);