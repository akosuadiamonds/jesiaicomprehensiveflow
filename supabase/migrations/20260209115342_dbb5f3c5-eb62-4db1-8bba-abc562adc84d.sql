
-- Create payment_methods table to track school payment methods
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  method_type text NOT NULL DEFAULT 'mobile_money', -- mobile_money, card, bank_transfer
  provider text, -- MTN, Vodafone, Visa, etc.
  account_number text,
  account_name text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage payment methods"
ON public.payment_methods FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School admins can view own payment methods"
ON public.payment_methods FOR SELECT
USING (institution_id IN (
  SELECT im.institution_id FROM institution_members im
  WHERE im.user_id = auth.uid() AND im.member_role = 'admin'
));

-- Create payment_transactions table for financial tracking
CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.school_subscriptions(id) ON DELETE SET NULL,
  institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GHS',
  payment_method text, -- mobile_money, card, bank_transfer
  reference_number text,
  status text NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  transaction_type text NOT NULL DEFAULT 'payment', -- payment, renewal, refund
  notes text,
  recorded_by uuid,
  transaction_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage payment transactions"
ON public.payment_transactions FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School admins can view own transactions"
ON public.payment_transactions FOR SELECT
USING (institution_id IN (
  SELECT im.institution_id FROM institution_members im
  WHERE im.user_id = auth.uid() AND im.member_role = 'admin'
));

-- Add renewal tracking columns to school_subscriptions
ALTER TABLE public.school_subscriptions
ADD COLUMN IF NOT EXISTS last_renewal_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS renewal_count integer NOT NULL DEFAULT 0;

-- Triggers
CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
