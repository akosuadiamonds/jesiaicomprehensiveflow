import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  SignupFormData, 
  TeacherProfileData, 
  UserRole, 
  PlanType, 
  OnboardingStep 
} from '@/types/onboarding';

const STORAGE_KEY = 'jesi_onboarding_state';

interface OnboardingState {
  currentStep: OnboardingStep;
  signupData: Partial<SignupFormData>;
  userRole: UserRole;
  teacherProfile: Partial<TeacherProfileData>;
  selectedPlan: PlanType | null;
}

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
  signOut: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const loadStoredState = (): Partial<OnboardingState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load onboarding state:', e);
  }
  return {};
};

const saveState = (state: OnboardingState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save onboarding state:', e);
  }
};

const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear onboarding state:', e);
  }
};

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const storedState = loadStoredState();
  
  const [currentStep, setCurrentStepInternal] = useState<OnboardingStep>(
    storedState.currentStep || 'role'
  );
  const [signupData, setSignupDataInternal] = useState<Partial<SignupFormData>>(
    storedState.signupData || {}
  );
  const [userRole, setUserRoleInternal] = useState<UserRole>(
    storedState.userRole || null
  );
  const [teacherProfile, setTeacherProfileInternal] = useState<Partial<TeacherProfileData>>(
    storedState.teacherProfile || {}
  );
  const [selectedPlan, setSelectedPlanInternal] = useState<PlanType | null>(
    storedState.selectedPlan || null
  );
  const [otp, setOtp] = useState('');

  // Persist state changes
  useEffect(() => {
    saveState({
      currentStep,
      signupData,
      userRole,
      teacherProfile,
      selectedPlan,
    });
  }, [currentStep, signupData, userRole, teacherProfile, selectedPlan]);

  const setCurrentStep = (step: OnboardingStep) => {
    setCurrentStepInternal(step);
  };

  const setSignupData = (data: Partial<SignupFormData>) => {
    setSignupDataInternal(data);
  };

  const setUserRole = (role: UserRole) => {
    setUserRoleInternal(role);
  };

  const setTeacherProfile = (data: Partial<TeacherProfileData>) => {
    setTeacherProfileInternal(data);
  };

  const setSelectedPlan = (plan: PlanType | null) => {
    setSelectedPlanInternal(plan);
  };

  const signOut = () => {
    clearState();
    setCurrentStepInternal('signup');
    setSignupDataInternal({});
    setUserRoleInternal(null);
    setTeacherProfileInternal({});
    setSelectedPlanInternal(null);
    setOtp('');
  };

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
        signOut,
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
