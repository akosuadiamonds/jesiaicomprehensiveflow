
-- Add fee_frequency column to classrooms
ALTER TABLE public.classrooms ADD COLUMN fee_frequency text NOT NULL DEFAULT 'monthly';
