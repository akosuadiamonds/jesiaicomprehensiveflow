
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('teacher', 'learner', 'school_admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: users can read their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS: school_admin can view roles of members in their institution
CREATE POLICY "School admins can view institution member roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'school_admin'
  )
);

-- Create institutions table
CREATE TABLE public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    region TEXT,
    phone TEXT,
    email TEXT,
    logo_url TEXT,
    selected_plan TEXT NOT NULL DEFAULT 'pro_institution',
    total_teacher_slots INTEGER NOT NULL DEFAULT 0,
    total_student_slots INTEGER NOT NULL DEFAULT 0,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;

-- Create institution_members table
CREATE TABLE public.institution_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    member_role TEXT NOT NULL DEFAULT 'teacher',
    is_active BOOLEAN NOT NULL DEFAULT true,
    added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (institution_id, user_id)
);

ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;

-- Trigger for institutions updated_at
CREATE TRIGGER update_institutions_updated_at
BEFORE UPDATE ON public.institutions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS for institutions: admins can manage their own institutions
CREATE POLICY "Admins can view own institutions"
ON public.institutions FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'school_admin')
  AND EXISTS (
    SELECT 1 FROM public.institution_members im
    WHERE im.institution_id = id AND im.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert institutions"
ON public.institutions FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'school_admin') AND created_by = auth.uid());

CREATE POLICY "Admins can update own institutions"
ON public.institutions FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'school_admin')
  AND EXISTS (
    SELECT 1 FROM public.institution_members im
    WHERE im.institution_id = id AND im.user_id = auth.uid() AND im.member_role = 'admin'
  )
);

-- RLS for institution_members
CREATE POLICY "Admins can view institution members"
ON public.institution_members FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.institution_members im
    WHERE im.institution_id = institution_id AND im.user_id = auth.uid() AND im.member_role = 'admin'
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Admins can add institution members"
ON public.institution_members FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.institution_members im
    WHERE im.institution_id = institution_id AND im.user_id = auth.uid() AND im.member_role = 'admin'
  )
  OR added_by = auth.uid()
);

CREATE POLICY "Admins can update institution members"
ON public.institution_members FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.institution_members im
    WHERE im.institution_id = institution_id AND im.user_id = auth.uid() AND im.member_role = 'admin'
  )
);

CREATE POLICY "Admins can remove institution members"
ON public.institution_members FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.institution_members im
    WHERE im.institution_id = institution_id AND im.user_id = auth.uid() AND im.member_role = 'admin'
  )
);

-- Allow school_admins to insert their own role during signup
CREATE POLICY "Users can insert own role"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow school admins to insert roles for institution members
CREATE POLICY "School admins can insert member roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'school_admin')
);
