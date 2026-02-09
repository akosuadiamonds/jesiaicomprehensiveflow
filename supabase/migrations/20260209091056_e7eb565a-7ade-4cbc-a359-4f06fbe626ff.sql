-- Drop the recursive policies on institution_members
DROP POLICY IF EXISTS "Admins can add institution members" ON public.institution_members;
DROP POLICY IF EXISTS "Admins can remove institution members" ON public.institution_members;
DROP POLICY IF EXISTS "Admins can update institution members" ON public.institution_members;
DROP POLICY IF EXISTS "Admins can view institution members" ON public.institution_members;

-- Recreate policies using has_role() to avoid recursion
-- INSERT: school_admins can insert, OR the user adding themselves (for initial setup)
CREATE POLICY "School admins can add institution members"
ON public.institution_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'school_admin') OR added_by = auth.uid()
);

-- SELECT: members can see their own membership, school_admins can see all in their institution
CREATE POLICY "Members can view institution members"
ON public.institution_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'school_admin')
);

-- UPDATE: school_admins can update
CREATE POLICY "School admins can update institution members"
ON public.institution_members
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'school_admin')
);

-- DELETE: school_admins can delete
CREATE POLICY "School admins can delete institution members"
ON public.institution_members
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'school_admin')
);