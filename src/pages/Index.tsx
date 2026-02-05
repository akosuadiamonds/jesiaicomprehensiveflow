import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import AuthPage from '@/components/auth/AuthPage';
import RoleStep from '@/components/onboarding/RoleStep';
import ProfileStep from '@/components/onboarding/ProfileStep';
import ProfileSuccessStep from '@/components/onboarding/ProfileSuccessStep';
import PlansStep from '@/components/onboarding/PlansStep';
import PaymentStep from '@/components/onboarding/PaymentStep';
import MainApp from '@/components/MainApp';
import { Loader2 } from 'lucide-react';

const stepConfig: Record<string, { step: number; showProgress: boolean }> = {
  role: { step: 1, showProgress: true },
  profile: { step: 2, showProgress: true },
  'profile-success': { step: 2, showProgress: true },
  plans: { step: 3, showProgress: true },
  payment: { step: 3, showProgress: true },
  dashboard: { step: 3, showProgress: false },
};

const OnboardingContent: React.FC = () => {
  const { currentStep } = useOnboarding();
  
  const config = stepConfig[currentStep] || { step: 1, showProgress: true };

  // Dashboard has its own layout with sidebar
  if (currentStep === 'dashboard') {
    return <MainApp />;
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
      case 'profile':
        return <ProfileStep />;
      case 'profile-success':
        return <ProfileSuccessStep />;
      case 'payment':
        return <PaymentStep />;
      default:
        return <RoleStep />;
    }
  };

  return (
    <OnboardingLayout
      showProgress={config.showProgress}
      currentStep={config.step}
      totalSteps={3}
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

  // Fully authenticated and onboarded - show main app
  return (
    <OnboardingProvider>
      <MainApp />
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
