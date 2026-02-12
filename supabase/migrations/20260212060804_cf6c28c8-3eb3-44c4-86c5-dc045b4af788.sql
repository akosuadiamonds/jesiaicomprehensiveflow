
-- Create cashout_requests table for teacher withdrawal requests
CREATE TABLE public.cashout_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GHS',
  payment_method TEXT NOT NULL DEFAULT 'mobile_money',
  account_details JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cashout_requests ENABLE ROW LEVEL SECURITY;

-- Teachers can view their own requests
CREATE POLICY "Teachers can view their own cashout requests"
ON public.cashout_requests FOR SELECT
USING (auth.uid() = teacher_id);

-- Teachers can create their own requests
CREATE POLICY "Teachers can create cashout requests"
ON public.cashout_requests FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

-- Super admins can manage all cashout requests
CREATE POLICY "Super admins can manage cashout requests"
ON public.cashout_requests FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));
