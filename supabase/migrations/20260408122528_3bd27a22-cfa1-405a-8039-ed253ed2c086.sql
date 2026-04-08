
-- Drop the existing self-insert policy
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- Recreate with school_admin allowed
CREATE POLICY "Users can insert own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id) AND (role = ANY (ARRAY['teacher'::app_role, 'learner'::app_role, 'school_admin'::app_role]))
);
