
-- Add class_grade column to classrooms for linking to student grades
ALTER TABLE public.classrooms ADD COLUMN class_grade text;

-- Create a function to auto-enroll institution students when a school classroom is created
CREATE OR REPLACE FUNCTION public.auto_enroll_institution_students()
RETURNS TRIGGER AS $$
DECLARE
  v_institution_id uuid;
  v_student record;
BEGIN
  -- Only for school classrooms with a class_grade
  IF NEW.classroom_type != 'school' OR NEW.class_grade IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find the teacher's institution
  SELECT institution_id INTO v_institution_id
  FROM public.institution_members
  WHERE user_id = NEW.teacher_id AND is_active = true
  LIMIT 1;

  IF v_institution_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Enroll all active students in the institution with matching class_grade
  INSERT INTO public.classroom_students (classroom_id, student_id, is_active, approval_status)
  SELECT NEW.id, im.user_id, true, 'approved'
  FROM public.institution_members im
  JOIN public.profiles p ON p.user_id = im.user_id
  WHERE im.institution_id = v_institution_id
    AND im.is_active = true
    AND im.member_role = 'student'
    AND p.class_grade = NEW.class_grade
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger after classroom insert
CREATE TRIGGER trg_auto_enroll_institution_students
AFTER INSERT ON public.classrooms
FOR EACH ROW
EXECUTE FUNCTION public.auto_enroll_institution_students();
