import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import RoleStep from '@/components/onboarding/RoleStep';
import SignupStep from '@/components/onboarding/SignupStep';
import PasswordStep from '@/components/onboarding/PasswordStep';
import VerifyStep from '@/components/onboarding/VerifyStep';
import SignInStep from '@/components/onboarding/SignInStep';
import SubjectsStep from '@/components/onboarding/SubjectsStep';
import ProfileStep from '@/components/onboarding/ProfileStep';
import ProfileSuccessStep from '@/components/onboarding/ProfileSuccessStep';
import PlansStep from '@/components/onboarding/PlansStep';
import PaymentStep from '@/components/onboarding/PaymentStep';
import MainApp from '@/components/MainApp';
import StudentApp from '@/components/student/StudentApp';
import SchoolAdminApp from '@/components/school-admin/SchoolAdminApp';
import SuperAdminApp from '@/components/super-admin/SuperAdminApp';
import StudentJoinClassStep from '@/components/student/onboarding/StudentJoinClassStep';
import StudentPlansStep from '@/components/student/onboarding/StudentPlansStep';
import StudentProfileStep from '@/components/student/onboarding/StudentProfileStep';
import SchoolDetailsStep from '@/components/school-admin/onboarding/SchoolDetailsStep';
import AdminSelectPackageStep from '@/components/school-admin/onboarding/AdminSelectPackageStep';
import AdminPaymentStep from '@/components/school-admin/onboarding/AdminPaymentStep';
import { Loader2 } from 'lucide-react';

// Pre-auth steps: role → signup → password → verify → signin
const preAuthSteps = ['role', 'signup', 'password', 'verify', 'signin'];

const preAuthStepConfig: Record<string, { step: number; totalSteps: number; showProgress: boolean }> = {
  role: { step: 1, totalSteps: 4, showProgress: false },
  signup: { step: 2, totalSteps: 4, showProgress: true },
  password: { step: 3, totalSteps: 4, showProgress: true },
  verify: { step: 4, totalSteps: 4, showProgress: true },
  signin: { step: 1, totalSteps: 1, showProgress: false },
};

// Post-auth steps config
const postAuthStepConfig: Record<string, { step: number; showProgress: boolean; totalSteps?: number }> = {
  // Teacher flow
  profile: { step: 1, showProgress: true, totalSteps: 3 },
  subjects: { step: 2, showProgress: true, totalSteps: 3 },
  'profile-success': { step: 2, showProgress: true, totalSteps: 3 },
  plans: { step: 3, showProgress: true, totalSteps: 3 },
  payment: { step: 3, showProgress: true, totalSteps: 3 },
  dashboard: { step: 3, showProgress: false },
  // Student flow
  'student-profile': { step: 1, showProgress: true, totalSteps: 3 },
  'student-join-class': { step: 2, showProgress: true, totalSteps: 3 },
  'student-plans': { step: 3, showProgress: true, totalSteps: 3 },
  'student-payment': { step: 3, showProgress: true, totalSteps: 3 },
  // Admin flow
  'admin-school-details': { step: 1, showProgress: true, totalSteps: 3 },
  'admin-select-package': { step: 2, showProgress: true, totalSteps: 3 },
  'admin-payment': { step: 3, showProgress: true, totalSteps: 3 },
};

// Component that syncs onboarding state with profile from database
const OnboardingStepSync: React.FC<{ onSynced?: () => void }> = ({ onSynced }) => {
  const { profile } = useAuth();
  const { setCurrentStep, setUserRole, setTeacherProfile, currentStep } = useOnboarding();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!profile || hasSynced.current) return;
    if (currentStep === 'payment' || currentStep === 'student-payment' || currentStep === 'admin-payment') return;
    if (currentStep === 'admin-select-package' || currentStep === 'admin-school-details') return;
    if (currentStep === 'student-join-class' || currentStep === 'student-plans') return;
    hasSynced.current = true;

    // Sync role from profile
    if (profile.user_role) {
      setUserRole(profile.user_role as 'teacher' | 'learner' | 'school_admin' | 'super_admin');
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
    const hasSelectedPlan = profile.selected_plan !== null && profile.selected_plan !== undefined;

    if (!hasRole) {
      // Role should already be set from pre-auth, but if not, go to profile
      setCurrentStep('profile');
    } else if (profile.user_role === 'super_admin') {
      // Super admins skip to dashboard
      setCurrentStep('dashboard');
    } else if (profile.user_role === 'school_admin') {
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
    
    onSynced?.();
  }, [profile?.user_id]);

  return null;
};

// Pre-auth onboarding (role → signup → password → verify → signin)
const PreAuthContent: React.FC = () => {
  const { currentStep } = useOnboarding();

  const config = preAuthStepConfig[currentStep] || { step: 1, totalSteps: 4, showProgress: false };

  const renderStep = () => {
    switch (currentStep) {
      case 'role':
        return <RoleStep />;
      case 'signup':
        return <SignupStep />;
      case 'password':
        return <PasswordStep />;
      case 'verify':
        return <VerifyStep />;
      case 'signin':
        return <SignInStep />;
      default:
        return <RoleStep />;
    }
  };

  return (
    <OnboardingLayout
      showProgress={config.showProgress}
      currentStep={config.step}
      totalSteps={config.totalSteps}
    >
      {renderStep()}
    </OnboardingLayout>
  );
};

// Post-auth onboarding (profile/subjects/plans etc.)
const PostAuthContent: React.FC = () => {
  const { currentStep } = useOnboarding();
  const [synced, setSynced] = useState(false);
  
  const handleSynced = () => setSynced(true);

  // Clear stale localStorage onboarding state on first mount
  useEffect(() => {
    try {
      localStorage.removeItem('jesi_onboarding_state');
    } catch (e) {
      // ignore
    }
  }, []);

  // Show loader until profile sync determines the correct step
  if (!synced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <OnboardingStepSync onSynced={handleSynced} />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const config = postAuthStepConfig[currentStep] || { step: 1, showProgress: true };

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

  // Admin package selection needs wider layout
  if (currentStep === 'admin-select-package') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <AdminSelectPackageStep />
      </div>
    );
  }

  // Payment steps
  if (currentStep === 'payment' || currentStep === 'student-payment') {
    return (
      <OnboardingLayout showProgress={true} currentStep={config.step} totalSteps={config.totalSteps || 3}>
        <PaymentStep />
      </OnboardingLayout>
    );
  }

  if (currentStep === 'admin-payment') {
    return (
      <OnboardingLayout showProgress={true} currentStep={config.step} totalSteps={config.totalSteps || 3}>
        <AdminPaymentStep />
      </OnboardingLayout>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
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
        return <ProfileStep />;
    }
  };

  const totalSteps = config.totalSteps || 3;

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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (!user) { setRoleChecked(true); return; }
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'super_admin')
        .maybeSingle();
      setIsSuperAdmin(!!data);
      setRoleChecked(true);
    };
    checkSuperAdmin();
  }, [user]);

  if (loading || !roleChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - show pre-auth onboarding (role → signup → password → verify)
  if (!user) {
    return (
      <OnboardingProvider>
        <PreAuthContent />
      </OnboardingProvider>
    );
  }

  // Super admin gets their own dashboard - no onboarding needed
  if (isSuperAdmin) {
    return <SuperAdminApp />;
  }

  // Check if profile indicates super_admin (newly selected during onboarding)
  if (profile?.user_role === 'super_admin') {
    return <SuperAdminApp />;
  }

  // Authenticated but profile setup not complete
  const hasRole = !!profile?.user_role;
  const hasSubjects = profile?.subjects && profile.subjects.length > 0;
  const hasSelectedPlan = profile?.selected_plan !== null && profile?.selected_plan !== undefined;
  const isSchoolAdminRole = profile?.user_role === 'school_admin';

  // Show post-auth onboarding if user hasn't completed all required steps
  const needsOnboarding = !hasRole || (isSchoolAdminRole
    ? !hasSelectedPlan
    : (!hasSubjects || !hasSelectedPlan));

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
