
-- 1. Fix payment_methods: restrict public viewing to authenticated users
DROP POLICY IF EXISTS "Anyone can view platform payment methods" ON public.payment_methods;
CREATE POLICY "Authenticated users can view platform payment methods"
ON public.payment_methods
FOR SELECT
TO authenticated
USING ((institution_id IS NULL) AND (is_active = true));

-- 2. Fix user_roles: restrict school admin INSERT to safe roles and scoped to institution
DROP POLICY IF EXISTS "School admins can insert member roles" ON public.user_roles;
CREATE POLICY "School admins can insert member roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'school_admin'::app_role)
  AND role IN ('teacher'::app_role, 'learner'::app_role)
  AND user_id IN (
    SELECT im.user_id FROM institution_members im
    WHERE im.institution_id IN (
      SELECT im2.institution_id FROM institution_members im2
      WHERE im2.user_id = auth.uid() AND im2.member_role = 'admin'
    )
  )
);

-- 3. Fix classrooms: restrict browsing to authenticated users
DROP POLICY IF EXISTS "Anyone can browse active private classrooms" ON public.classrooms;
CREATE POLICY "Authenticated users can browse active private classrooms"
ON public.classrooms
FOR SELECT
TO authenticated
USING ((classroom_type = 'private'::classroom_type) AND (is_active = true));
