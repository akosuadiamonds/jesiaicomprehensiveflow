-- Fix institutions INSERT policy: allow any authenticated user to create their own institution
-- (the created_by check ensures they can only create for themselves)
DROP POLICY IF EXISTS "Admins can insert institutions" ON public.institutions;
CREATE POLICY "Users can create institutions"
ON public.institutions
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Fix user_roles INSERT: allow users to insert their own role (already exists but let's ensure)
-- The duplicate key error means we need to handle this in code with upsert
