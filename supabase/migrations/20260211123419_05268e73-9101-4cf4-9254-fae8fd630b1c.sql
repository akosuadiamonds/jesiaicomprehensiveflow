
CREATE POLICY "Anyone can browse active private classrooms"
ON public.classrooms
FOR SELECT
USING (classroom_type = 'private' AND is_active = true);
