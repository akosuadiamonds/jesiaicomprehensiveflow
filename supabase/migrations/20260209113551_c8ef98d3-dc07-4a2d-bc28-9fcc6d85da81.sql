
-- Fix the recursive policy on user_roles
DROP POLICY IF EXISTS "School admins can view institution member roles" ON public.user_roles;
DROP POLICY IF EXISTS "School admins can insert member roles" ON public.user_roles;

-- Recreate using has_role (SECURITY DEFINER bypasses RLS)
CREATE POLICY "School admins can view institution member roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'school_admin'));

CREATE POLICY "School admins can insert member roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'school_admin'));
