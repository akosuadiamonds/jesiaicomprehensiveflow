import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  SignupFormData, 
  TeacherProfileData, 
  UserRole, 
  PlanType, 
  OnboardingStep 
} from '@/types/onboarding';

interface OnboardingContextType {
  currentStep: OnboardingStep;
  setCurrentStep: (step: OnboardingStep) => void;
  signupData: Partial<SignupFormData>;
  setSignupData: (data: Partial<SignupFormData>) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  teacherProfile: Partial<TeacherProfileData>;
  setTeacherProfile: (data: Partial<TeacherProfileData>) => void;
  selectedPlan: PlanType | null;
  setSelectedPlan: (plan: PlanType | null) => void;
  otp: string;
  setOtp: (otp: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('signup');
  const [signupData, setSignupData] = useState<Partial<SignupFormData>>({});
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [teacherProfile, setTeacherProfile] = useState<Partial<TeacherProfileData>>({});
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [otp, setOtp] = useState('');

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        signupData,
        setSignupData,
        userRole,
        setUserRole,
        teacherProfile,
        setTeacherProfile,
        selectedPlan,
        setSelectedPlan,
        otp,
        setOtp,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
