
-- Fix the institutions SELECT policy: 
-- 1. The old policy has a bug: im.institution_id = im.id (self-referencing instead of institutions.id)
-- 2. Also allow the creator to view their institution directly

DROP POLICY IF EXISTS "Admins can view own institutions" ON public.institutions;
CREATE POLICY "Admins can view own institutions"
ON public.institutions
FOR SELECT
TO authenticated
USING (
  created_by = auth.uid()
  OR (
    has_role(auth.uid(), 'school_admin') 
    AND EXISTS (
      SELECT 1 FROM institution_members im
      WHERE im.institution_id = institutions.id AND im.user_id = auth.uid()
    )
  )
);

-- Also fix the UPDATE policy which has the same bug
DROP POLICY IF EXISTS "Admins can update own institutions" ON public.institutions;
CREATE POLICY "Admins can update own institutions"
ON public.institutions
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'school_admin') 
  AND EXISTS (
    SELECT 1 FROM institution_members im
    WHERE im.institution_id = institutions.id AND im.user_id = auth.uid() AND im.member_role = 'admin'
  )
);
