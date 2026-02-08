
-- Add approval_status column to classroom_students
ALTER TABLE public.classroom_students 
ADD COLUMN approval_status text NOT NULL DEFAULT 'approved';

-- For private classrooms, new join requests should default to 'pending'
-- We'll handle this in application code

-- Update RLS: students can only see their own enrollments (already exists)
-- Teachers need to see pending requests too (already covered by existing policy)
