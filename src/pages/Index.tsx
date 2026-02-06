import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import AuthPage from '@/components/auth/AuthPage';
import RoleStep from '@/components/onboarding/RoleStep';
import SubjectsStep from '@/components/onboarding/SubjectsStep';
import ProfileStep from '@/components/onboarding/ProfileStep';
import ProfileSuccessStep from '@/components/onboarding/ProfileSuccessStep';
import PlansStep from '@/components/onboarding/PlansStep';
import PaymentStep from '@/components/onboarding/PaymentStep';
import MainApp from '@/components/MainApp';
import StudentApp from '@/components/student/StudentApp';
import StudentJoinClassStep from '@/components/student/onboarding/StudentJoinClassStep';
import StudentPlansStep from '@/components/student/onboarding/StudentPlansStep';
import { Loader2 } from 'lucide-react';

const stepConfig: Record<string, { step: number; showProgress: boolean; totalSteps?: number }> = {
  role: { step: 1, showProgress: true },
  profile: { step: 2, showProgress: true },
  subjects: { step: 3, showProgress: true },
  'profile-success': { step: 3, showProgress: true },
  plans: { step: 4, showProgress: true },
  payment: { step: 4, showProgress: true },
  dashboard: { step: 4, showProgress: false },
  'student-join-class': { step: 2, showProgress: true, totalSteps: 4 },
  'student-plans': { step: 3, showProgress: true, totalSteps: 4 },
  'student-payment': { step: 4, showProgress: true, totalSteps: 4 },
};

// Component that syncs onboarding state with profile from database
const OnboardingStepSync: React.FC = () => {
  const { profile } = useAuth();
  const { setCurrentStep, setUserRole, setTeacherProfile, currentStep } = useOnboarding();

  useEffect(() => {
    if (!profile) return;

    // Always sync role from profile (overwrite localStorage)
    if (profile.user_role) {
      setUserRole(profile.user_role as 'teacher' | 'learner');
    } else {
      setUserRole(null);
    }

    // Always sync subjects from profile (overwrite localStorage)
    // This ensures the database is the source of truth
    setTeacherProfile({ 
      subjects: profile.subjects || [],
      phoneNumber: profile.phone_number || '',
      schoolName: profile.school_name || ''
    });

    // Determine the correct step based on profile completion
    const hasRole = !!profile.user_role;
    const hasProfileDetails = profile.phone_number && profile.school_name;
    const hasSubjects = profile.subjects && profile.subjects.length > 0;
    const hasSelectedPlan = profile.selected_plan !== null;

    // Only update step if we're not already on a later step
    if (!hasRole) {
      setCurrentStep('role');
    } else if (profile.user_role === 'learner') {
      // Learner flow: role -> subjects -> join class -> plans
      if (!hasSubjects) {
        setCurrentStep('subjects');
      } else if (!hasSelectedPlan) {
        setCurrentStep('student-plans');
      }
    } else {
      // Teacher flow: role -> profile -> subjects -> profile-success -> plans
      if (!hasProfileDetails) {
        setCurrentStep('profile');
      } else if (!hasSubjects) {
        setCurrentStep('subjects');
      } else if (!hasSelectedPlan) {
        setCurrentStep('plans');
      }
    }
  }, [profile?.user_id]); // Only run when user changes, not on every profile update

  return null;
};

const OnboardingContent: React.FC = () => {
  const { currentStep } = useOnboarding();
  
  const config = stepConfig[currentStep] || { step: 1, showProgress: true };

  // Dashboard has its own layout with sidebar
  if (currentStep === 'dashboard') {
    return <MainApp />;
  }

  // Student plans step needs wider layout
  if (currentStep === 'student-plans') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <OnboardingStepSync />
        <StudentPlansStep />
      </div>
    );
  }

  // Plans step needs wider layout
  if (currentStep === 'plans') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <OnboardingStepSync />
        <PlansStep />
      </div>
    );
  }

  // Payment step for paid plans
  if (currentStep === 'payment' || currentStep === 'student-payment') {
    return (
      <OnboardingLayout showProgress={true} currentStep={4} totalSteps={4}>
        <OnboardingStepSync />
        <PaymentStep />
      </OnboardingLayout>
    );
  }
  const renderStep = () => {
    switch (currentStep) {
      case 'role':
        return <RoleStep />;
      case 'subjects':
        return <SubjectsStep />;
      case 'profile':
        return <ProfileStep />;
      case 'profile-success':
        return <ProfileSuccessStep />;
      case 'student-join-class':
        return <StudentJoinClassStep />;
      default:
        return <RoleStep />;
    }
  };

  // Student onboarding uses 3 steps, teacher uses 4
  const totalSteps = currentStep.startsWith('student') ? 3 : 4;

  return (
    <>
      <OnboardingStepSync />
      <OnboardingLayout
        showProgress={config.showProgress}
        currentStep={config.step}
        totalSteps={totalSteps}
      >
        {renderStep()}
      </OnboardingLayout>
    </>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - show auth page
  if (!user) {
    return <AuthPage />;
  }

  // Authenticated but profile setup not complete
  // Check if they have completed onboarding:
  // 1. Has subjects selected
  // 2. Has explicitly selected a plan (selected_plan is not null)
  const hasSubjects = profile?.subjects && profile.subjects.length > 0;
  const hasSelectedPlan = profile?.selected_plan !== null && profile?.selected_plan !== undefined;

  // Show onboarding if user hasn't completed all required steps
  if (!hasSubjects || !hasSelectedPlan) {
    return (
      <OnboardingProvider>
        <OnboardingContent />
      </OnboardingProvider>
    );
  }

  // Fully authenticated and onboarded - show appropriate app based on role
  const isLearner = profile?.user_role === 'learner';
  
  return (
    <OnboardingProvider>
      {isLearner ? <StudentApp /> : <MainApp />}
    </OnboardingProvider>
  );
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default Index;
