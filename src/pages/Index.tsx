import React, { useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import SignupStep from '@/components/onboarding/SignupStep';
import PasswordStep from '@/components/onboarding/PasswordStep';
import VerifyStep from '@/components/onboarding/VerifyStep';
import SignInStep from '@/components/onboarding/SignInStep';
import RoleStep from '@/components/onboarding/RoleStep';
import SubjectsStep from '@/components/onboarding/SubjectsStep';
import ProfileStep from '@/components/onboarding/ProfileStep';
import ProfileSuccessStep from '@/components/onboarding/ProfileSuccessStep';
import PlansStep from '@/components/onboarding/PlansStep';
import PaymentStep from '@/components/onboarding/PaymentStep';
import MainApp from '@/components/MainApp';
import StudentApp from '@/components/student/StudentApp';
import SchoolAdminApp from '@/components/school-admin/SchoolAdminApp';
import StudentJoinClassStep from '@/components/student/onboarding/StudentJoinClassStep';
import StudentPlansStep from '@/components/student/onboarding/StudentPlansStep';
import StudentProfileStep from '@/components/student/onboarding/StudentProfileStep';
import SchoolDetailsStep from '@/components/school-admin/onboarding/SchoolDetailsStep';
import AdminSelectPackageStep from '@/components/school-admin/onboarding/AdminSelectPackageStep';
import AdminPaymentStep from '@/components/school-admin/onboarding/AdminPaymentStep';
import { Loader2 } from 'lucide-react';

// Pre-auth steps (before user is authenticated)
const preAuthSteps = ['signup', 'password', 'verify', 'signin'];

const preAuthStepConfig: Record<string, { step: number; totalSteps: number }> = {
  signup: { step: 1, totalSteps: 3 },
  password: { step: 2, totalSteps: 3 },
  verify: { step: 3, totalSteps: 3 },
  signin: { step: 1, totalSteps: 1 },
};

// Post-auth steps (after user is authenticated)
const postAuthStepConfig: Record<string, { step: number; showProgress: boolean; totalSteps?: number }> = {
  role: { step: 1, showProgress: true },
  profile: { step: 2, showProgress: true },
  subjects: { step: 3, showProgress: true },
  'profile-success': { step: 3, showProgress: true },
  plans: { step: 4, showProgress: true },
  payment: { step: 4, showProgress: true },
  dashboard: { step: 4, showProgress: false },
  'student-profile': { step: 2, showProgress: true, totalSteps: 5 },
  'student-join-class': { step: 3, showProgress: true, totalSteps: 5 },
  'student-plans': { step: 4, showProgress: true, totalSteps: 5 },
  'student-payment': { step: 5, showProgress: true, totalSteps: 5 },
  'admin-school-details': { step: 2, showProgress: true, totalSteps: 4 },
  'admin-select-package': { step: 3, showProgress: true, totalSteps: 4 },
  'admin-payment': { step: 4, showProgress: true, totalSteps: 4 },
};

// Component that syncs onboarding state with profile from database
const OnboardingStepSync: React.FC = () => {
  const { profile } = useAuth();
  const { setCurrentStep, setUserRole, setTeacherProfile, currentStep } = useOnboarding();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!profile || hasSynced.current) return;
    if (currentStep === 'payment' || currentStep === 'student-payment' || currentStep === 'admin-payment') return;
    // Don't override navigation if already on a forward admin/student step
    if (currentStep === 'admin-select-package' || currentStep === 'admin-school-details') return;
    if (currentStep === 'student-join-class' || currentStep === 'student-plans') return;
    hasSynced.current = true;

    // Sync role from profile
    if (profile.user_role) {
      setUserRole(profile.user_role as 'teacher' | 'learner');
    } else {
      setUserRole(null);
    }

    // Sync subjects from profile
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

    if (!hasRole) {
      setCurrentStep('role');
    } else if (profile.user_role === 'school_admin') {
      // School admin flow
      if (!hasSelectedPlan) {
        setCurrentStep('admin-school-details');
      }
    } else if (profile.user_role === 'learner') {
      const hasParentContact = !!(profile as any).parent_contact;
      if (!hasParentContact) {
        setCurrentStep('student-profile');
      } else if (!hasSelectedPlan) {
        setCurrentStep('student-plans');
      }
    } else {
      // Teacher flow
      if (!hasProfileDetails) {
        setCurrentStep('profile');
      } else if (!hasSubjects) {
        setCurrentStep('subjects');
      } else if (!hasSelectedPlan) {
        setCurrentStep('plans');
      }
    }
  }, [profile?.user_id]);

  return null;
};

// Pre-auth onboarding (signup/password/verify/signin)
const PreAuthContent: React.FC = () => {
  const { currentStep } = useOnboarding();

  const config = preAuthStepConfig[currentStep] || { step: 1, totalSteps: 3 };
  const showProgress = currentStep !== 'signin';

  const renderStep = () => {
    switch (currentStep) {
      case 'signup':
        return <SignupStep />;
      case 'password':
        return <PasswordStep />;
      case 'verify':
        return <VerifyStep />;
      case 'signin':
        return <SignInStep />;
      default:
        return <SignupStep />;
    }
  };

  return (
    <OnboardingLayout
      showProgress={showProgress}
      currentStep={config.step}
      totalSteps={config.totalSteps}
    >
      {renderStep()}
    </OnboardingLayout>
  );
};

// Post-auth onboarding (role/profile/subjects/plans etc.)
const PostAuthContent: React.FC = () => {
  const { currentStep } = useOnboarding();
  
  const config = postAuthStepConfig[currentStep] || { step: 1, showProgress: true };

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

  // Admin package selection needs wider layout
  if (currentStep === 'admin-select-package') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <OnboardingStepSync />
        <AdminSelectPackageStep />
      </div>
    );
  }

  // Payment steps
  if (currentStep === 'payment' || currentStep === 'student-payment') {
    return (
      <OnboardingLayout showProgress={true} currentStep={4} totalSteps={4}>
        <OnboardingStepSync />
        <PaymentStep />
      </OnboardingLayout>
    );
  }

  if (currentStep === 'admin-payment') {
    return (
      <OnboardingLayout showProgress={true} currentStep={4} totalSteps={4}>
        <OnboardingStepSync />
        <AdminPaymentStep />
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
      case 'student-profile':
        return <StudentProfileStep />;
      case 'student-join-class':
        return <StudentJoinClassStep />;
      case 'admin-school-details':
        return <SchoolDetailsStep />;
      default:
        return <RoleStep />;
    }
  };

  // Student onboarding uses 5 steps, teacher uses 4
  const totalSteps = currentStep.startsWith('student') ? 5 : currentStep.startsWith('admin') ? 4 : 4;

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

  // Not authenticated - show pre-auth onboarding (signup/password/verify)
  if (!user) {
    return (
      <OnboardingProvider>
        <PreAuthContent />
      </OnboardingProvider>
    );
  }

  // Authenticated but profile setup not complete
  const hasSubjects = profile?.subjects && profile.subjects.length > 0;
  const hasSelectedPlan = profile?.selected_plan !== null && profile?.selected_plan !== undefined;
  const isSchoolAdminRole = profile?.user_role === 'school_admin';

  // Show post-auth onboarding if user hasn't completed all required steps
  // School admins don't need subjects — they just need a plan
  const needsOnboarding = isSchoolAdminRole
    ? !hasSelectedPlan
    : (!hasSubjects || !hasSelectedPlan);

  if (needsOnboarding) {
    return (
      <OnboardingProvider>
        <PostAuthContent />
      </OnboardingProvider>
    );
  }

  // Fully authenticated and onboarded - show appropriate app based on role
  const isLearner = profile?.user_role === 'learner';
  const isSchoolAdmin = profile?.user_role === 'school_admin';
  
  return (
    <OnboardingProvider>
      {isSchoolAdmin ? <SchoolAdminApp /> : isLearner ? <StudentApp /> : <MainApp />}
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
