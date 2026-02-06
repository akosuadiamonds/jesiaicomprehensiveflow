-- Change default value of selected_plan to NULL so we can detect if user has completed plan selection
ALTER TABLE public.profiles ALTER COLUMN selected_plan SET DEFAULT NULL;

-- Update existing profiles that have empty subjects (haven't completed onboarding) to have NULL selected_plan
UPDATE public.profiles 
SET selected_plan = NULL 
WHERE subjects IS NULL OR array_length(subjects, 1) IS NULL OR array_length(subjects, 1) = 0;