
-- Drop the recursive super admin select policy
DROP POLICY IF EXISTS "Super admins can select all roles" ON public.user_roles;
