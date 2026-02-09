
-- Drop the recursive policy entirely
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

-- Super admins can SELECT all roles (using security definer function is safe for SELECT)
CREATE POLICY "Super admins can select all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

-- Super admins can INSERT roles
CREATE POLICY "Super admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Super admins can DELETE roles
CREATE POLICY "Super admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'super_admin'));
