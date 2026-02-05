import React from 'react';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import SignupStep from '@/components/onboarding/SignupStep';
import PasswordStep from '@/components/onboarding/PasswordStep';
import VerifyStep from '@/components/onboarding/VerifyStep';
import RoleStep from '@/components/onboarding/RoleStep';
import ProfileStep from '@/components/onboarding/ProfileStep';
import ProfileSuccessStep from '@/components/onboarding/ProfileSuccessStep';
import PlansStep from '@/components/onboarding/PlansStep';
import PaymentStep from '@/components/onboarding/PaymentStep';
import DashboardStep from '@/components/onboarding/DashboardStep';

const stepConfig: Record<string, { step: number; showProgress: boolean }> = {
  signup: { step: 1, showProgress: true },
  password: { step: 2, showProgress: true },
  verify: { step: 3, showProgress: true },
  role: { step: 4, showProgress: true },
  profile: { step: 5, showProgress: true },
  'profile-success': { step: 5, showProgress: true },
  plans: { step: 6, showProgress: true },
  payment: { step: 6, showProgress: true },
  dashboard: { step: 6, showProgress: false },
};

const OnboardingContent: React.FC = () => {
  const { currentStep } = useOnboarding();
  
  const config = stepConfig[currentStep] || { step: 1, showProgress: true };

  // Dashboard has its own layout
  if (currentStep === 'dashboard') {
    return <DashboardStep />;
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
      case 'signup':
        return <SignupStep />;
      case 'password':
        return <PasswordStep />;
      case 'verify':
        return <VerifyStep />;
      case 'role':
        return <RoleStep />;
      case 'profile':
        return <ProfileStep />;
      case 'profile-success':
        return <ProfileSuccessStep />;
      case 'payment':
        return <PaymentStep />;
      default:
        return <SignupStep />;
    }
  };

  return (
    <OnboardingLayout
      showProgress={config.showProgress}
      currentStep={config.step}
      totalSteps={6}
    >
      {renderStep()}
    </OnboardingLayout>
  );
};

const Index: React.FC = () => {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
};

export default Index;
