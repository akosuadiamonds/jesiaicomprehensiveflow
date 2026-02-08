
-- Add student-specific profile fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS parent_contact text,
ADD COLUMN IF NOT EXISTS class_grade text;

-- Create a rewards table for coin redemption
CREATE TABLE public.student_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  cost integer NOT NULL,
  reward_type text NOT NULL DEFAULT 'badge',
  icon text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.student_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rewards"
ON public.student_rewards FOR SELECT
USING (true);

-- Create redeemed rewards tracking
CREATE TABLE public.student_redeemed_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL,
  reward_id uuid NOT NULL REFERENCES public.student_rewards(id),
  redeemed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.student_redeemed_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own redeemed rewards"
ON public.student_redeemed_rewards FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can redeem rewards"
ON public.student_redeemed_rewards FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Seed some rewards
INSERT INTO public.student_rewards (name, description, cost, reward_type, icon) VALUES
('Math Wizard', 'Show off your math skills with this title', 50, 'title', '🧮'),
('Science Star', 'A badge for science enthusiasts', 75, 'badge', '⭐'),
('Bookworm', 'For those who love reading', 60, 'badge', '📚'),
('Speed Demon', 'Complete 5 timed exams', 100, 'title', '⚡'),
('Perfect Score', 'Achieve 100% on any quiz', 150, 'badge', '💯'),
('Study Streak Master', 'Maintain a 30-day streak', 200, 'badge', '🔥'),
('Extra Practice Pass', 'Unlock 10 bonus practice questions', 30, 'consumable', '🎫'),
('Double Coins Boost', 'Earn 2x coins for 24 hours', 80, 'consumable', '✨'),
('Custom Avatar Frame', 'A special frame for your profile', 120, 'cosmetic', '🖼️'),
('Class Champion', 'Top performer badge', 250, 'badge', '🏆');
