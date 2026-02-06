import React from 'react';
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

const stepConfig: Record<string, { step: number; showProgress: boolean }> = {
  role: { step: 1, showProgress: true },
  subjects: { step: 2, showProgress: true },
  profile: { step: 3, showProgress: true },
  'profile-success': { step: 3, showProgress: true },
  plans: { step: 4, showProgress: true },
  payment: { step: 4, showProgress: true },
  dashboard: { step: 4, showProgress: false },
  'student-join-class': { step: 2, showProgress: true },
  'student-plans': { step: 3, showProgress: true },
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
        <StudentPlansStep />
      </div>
    );
  }

  // Plans step needs wider layout
  if (currentStep === 'plans') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <PlansStep />
      </div>
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
      case 'payment':
        return <PaymentStep />;
      case 'student-join-class':
        return <StudentJoinClassStep />;
      default:
        return <RoleStep />;
    }
  };

  // Student onboarding uses 3 steps, teacher uses 4
  const totalSteps = currentStep.startsWith('student') ? 3 : 4;

  return (
    <OnboardingLayout
      showProgress={config.showProgress}
      currentStep={config.step}
      totalSteps={totalSteps}
    >
      {renderStep()}
    </OnboardingLayout>
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
  // Check if they have completed onboarding (has subjects selected)
  const hasCompletedOnboarding = profile?.subjects && profile.subjects.length > 0;

  if (!hasCompletedOnboarding) {
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
