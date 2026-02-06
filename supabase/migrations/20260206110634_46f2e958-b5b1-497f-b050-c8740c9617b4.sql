-- Fix the infinite recursion in classrooms RLS policy
-- The bug: classroom_students.classroom_id = classroom_students.id (self-referencing instead of classrooms.id)
DROP POLICY IF EXISTS "Students can view classrooms they joined" ON public.classrooms;

CREATE POLICY "Students can view classrooms they joined"
ON public.classrooms
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM classroom_students
    WHERE classroom_students.classroom_id = classrooms.id
    AND classroom_students.student_id = auth.uid()
    AND classroom_students.is_active = true
  )
);