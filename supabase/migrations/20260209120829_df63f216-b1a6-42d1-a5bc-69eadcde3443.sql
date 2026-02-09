
-- Make institution_id nullable on payment_methods so we can have platform-level methods
ALTER TABLE public.payment_methods ALTER COLUMN institution_id DROP NOT NULL;

-- Add a SELECT policy so super admins can see platform-level payment methods (institution_id IS NULL)
-- The existing ALL policy for super admins already covers this

-- Add policy for anyone to view platform payment methods (for display on payment pages)
CREATE POLICY "Anyone can view platform payment methods"
ON public.payment_methods FOR SELECT
USING (institution_id IS NULL AND is_active = true);
