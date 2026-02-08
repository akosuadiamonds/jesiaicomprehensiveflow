-- Fix infinite recursion: classrooms -> classroom_students -> classrooms

-- Create security definer functions to break the cycle
CREATE OR REPLACE FUNCTION public.get_classroom_ids_for_student(p_student_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT classroom_id FROM classroom_students 
  WHERE student_id = p_student_id AND is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.get_classroom_ids_for_teacher(p_teacher_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM classrooms WHERE teacher_id = p_teacher_id;
$$;

-- Drop and recreate the problematic policies
DROP POLICY IF EXISTS "Students can view classrooms they joined" ON classrooms;
CREATE POLICY "Students can view classrooms they joined" ON classrooms
  FOR SELECT USING (id IN (SELECT get_classroom_ids_for_student(auth.uid())));

DROP POLICY IF EXISTS "Teachers can view students in their classrooms" ON classroom_students;
CREATE POLICY "Teachers can view students in their classrooms" ON classroom_students
  FOR SELECT USING (classroom_id IN (SELECT get_classroom_ids_for_teacher(auth.uid())));

DROP POLICY IF EXISTS "Teachers can manage students in their classrooms" ON classroom_students;
CREATE POLICY "Teachers can manage students in their classrooms" ON classroom_students
  FOR UPDATE USING (classroom_id IN (SELECT get_classroom_ids_for_teacher(auth.uid())));

DROP POLICY IF EXISTS "Teachers can remove students from their classrooms" ON classroom_students;
CREATE POLICY "Teachers can remove students from their classrooms" ON classroom_students
  FOR DELETE USING (classroom_id IN (SELECT get_classroom_ids_for_teacher(auth.uid())));
