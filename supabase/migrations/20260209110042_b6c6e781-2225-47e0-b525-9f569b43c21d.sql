
-- Create a table for pending institution invites (users not yet signed up)
CREATE TABLE public.pending_institution_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  invited_role TEXT NOT NULL DEFAULT 'teacher',
  date_of_birth TEXT,
  level_grade TEXT,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  invited_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_institution_invites ENABLE ROW LEVEL SECURITY;

-- School admins can manage pending invites
CREATE POLICY "School admins can view pending invites"
ON public.pending_institution_invites FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'school_admin'::app_role)
  AND institution_id IN (
    SELECT im.institution_id FROM institution_members im
    WHERE im.user_id = auth.uid() AND im.member_role = 'admin'
  )
);

CREATE POLICY "School admins can insert pending invites"
ON public.pending_institution_invites FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'school_admin'::app_role)
  AND invited_by = auth.uid()
);

CREATE POLICY "School admins can update pending invites"
ON public.pending_institution_invites FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'school_admin'::app_role)
  AND institution_id IN (
    SELECT im.institution_id FROM institution_members im
    WHERE im.user_id = auth.uid() AND im.member_role = 'admin'
  )
);

CREATE POLICY "School admins can delete pending invites"
ON public.pending_institution_invites FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'school_admin'::app_role)
  AND institution_id IN (
    SELECT im.institution_id FROM institution_members im
    WHERE im.user_id = auth.uid() AND im.member_role = 'admin'
  )
);
