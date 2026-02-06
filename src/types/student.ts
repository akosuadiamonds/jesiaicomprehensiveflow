export type StudentPage = 'learn' | 'practice' | 'class' | 'streak' | 'insights' | 'profile';

export interface StudentCoins {
  id: string;
  student_id: string;
  coins: number;
  total_earned: number;
  streak_days: number;
  last_login_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoinTransaction {
  id: string;
  student_id: string;
  amount: number;
  transaction_type: 'earn' | 'spend';
  source: string;
  description: string | null;
  created_at: string;
}

export interface PracticeSession {
  id: string;
  student_id: string;
  subject: string;
  topic: string;
  session_type: 'quick' | 'mock' | 'timed_exam';
  total_questions: number;
  correct_answers: number;
  time_spent_seconds: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  questions_data: any;
  completed_at: string | null;
  created_at: string;
}

export interface LearningProgress {
  id: string;
  student_id: string;
  subject: string;
  topic: string;
  progress_percent: number;
  lessons_completed: number;
  total_lessons: number;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
}

export interface StudentPlan {
  id: 'free' | 'pro' | 'premium';
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
}

export const studentPlans: StudentPlan[] = [
  {
    id: 'free',
    name: 'Explorer',
    price: 0,
    currency: 'GHS',
    period: 'forever',
    features: [
      'Access to Learn Zone basics',
      '5 practice questions per day',
      'Join 1 classroom',
      'Basic progress tracking',
    ],
  },
  {
    id: 'pro',
    name: 'Achiever',
    price: 15,
    currency: 'GHS',
    period: 'month',
    features: [
      'Full Learn Zone access',
      'Unlimited practice questions',
      'Join unlimited classrooms',
      'AI-powered mock exams',
      'Timed exam simulation',
      'Detailed performance analytics',
    ],
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'premium',
    name: 'Champion',
    price: 30,
    currency: 'GHS',
    period: 'month',
    features: [
      'Everything in Achiever',
      'Live class access',
      'Video lessons library',
      'Personalized study plan',
      'Priority support',
      'Exclusive rewards & badges',
    ],
  },
];
