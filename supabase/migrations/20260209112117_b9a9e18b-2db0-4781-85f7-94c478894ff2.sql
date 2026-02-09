
-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  plan_type text NOT NULL DEFAULT 'individual',
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GHS',
  billing_period text NOT NULL DEFAULT 'monthly',
  token_allocation integer NOT NULL DEFAULT 5000,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage plans"
ON public.subscription_plans FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

-- Create school_subscriptions table
CREATE TABLE public.school_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES public.subscription_plans(id) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'unpaid',
  invited_email text,
  teacher_slots integer NOT NULL DEFAULT 0,
  student_slots integer NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GHS',
  starts_at timestamptz,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.school_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage school subscriptions"
ON public.school_subscriptions FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "School admins can view own subscriptions"
ON public.school_subscriptions FOR SELECT
USING (institution_id IN (
  SELECT im.institution_id FROM institution_members im
  WHERE im.user_id = auth.uid() AND im.member_role = 'admin'
));

-- Super admin RLS policies on existing tables
CREATE POLICY "Super admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update all profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can view all institutions"
ON public.institutions FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage all institutions"
ON public.institutions FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can view all roles"
ON public.user_roles FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can view all institution members"
ON public.institution_members FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage all institution members"
ON public.institution_members FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Triggers
CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_school_subscriptions_updated_at
BEFORE UPDATE ON public.school_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default plans
INSERT INTO public.subscription_plans (name, plan_type, price, currency, billing_period, token_allocation, features) VALUES
('Free Trial', 'individual', 0, 'GHS', '5 days', 5000, '["GES Lesson Planning","Quiz Generation","Basic Analytics","5,000 tokens"]'),
('Pro', 'individual', 25, 'GHS', 'monthly', 30000, '["Everything in Free","Unlimited Lesson Plans","Quiz Generation","30,000 tokens"]'),
('Premium', 'individual', 50, 'GHS', 'monthly', 80000, '["Everything in Pro","Private Classes","Student Tracking","Incentives & Rewards","80,000 tokens"]'),
('Pro Institution', 'institutional', 0, 'GHS', 'monthly', 0, '["10 GHS/student (20k tokens)","20 GHS/teacher (30k tokens)","Bulk discounts available"]'),
('Premium Institution', 'institutional', 0, 'GHS', 'monthly', 0, '["20 GHS/student (50k tokens)","50 GHS/teacher (80k tokens)","Bulk discounts available"]');
