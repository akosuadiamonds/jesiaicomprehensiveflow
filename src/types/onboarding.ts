export interface SignupFormData {
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  receiveEmails: boolean;
}

export interface TeacherProfileData {
  phoneNumber: string;
  schoolName: string;
  subjects: string[];
}

export type UserRole = 'teacher' | 'learner' | null;

export type PlanType = 'free' | 'pro' | 'premium';

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  tokens?: number;
  highlight?: boolean;
  badge?: string;
}

export type OnboardingStep = 
  | 'signup'
  | 'password'
  | 'verify'
  | 'signin'
  | 'role'
  | 'subjects'
  | 'profile'
  | 'profile-success'
  | 'plans'
  | 'payment'
  | 'dashboard'
  | 'student-profile'
  | 'student-join-class'
  | 'student-plans'
  | 'student-payment';
