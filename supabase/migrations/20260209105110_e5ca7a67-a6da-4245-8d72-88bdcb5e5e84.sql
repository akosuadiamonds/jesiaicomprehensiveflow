
-- Allow school admins to view profiles of their institution members
CREATE POLICY "School admins can view institution member profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  user_id IN (
    SELECT im.user_id FROM institution_members im
    WHERE im.institution_id IN (
      SELECT im2.institution_id FROM institution_members im2
      WHERE im2.user_id = auth.uid() AND im2.member_role = 'admin'
    )
  )
);
