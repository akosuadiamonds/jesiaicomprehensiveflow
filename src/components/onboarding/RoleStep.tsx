import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { GraduationCap, BookOpen, Building2, Shield, ArrowRight } from 'lucide-react';
import { UserRole } from '@/types/onboarding';

const ROLES = [
  {
    id: 'teacher' as const,
    label: "I'm a Teacher",
    description: 'Create lesson plans, generate quizzes, track student progress, and more with AI-powered tools.',
    icon: GraduationCap,
    features: ['Lesson Planning', 'Quiz Generation', 'Student Tracking'],
  },
  {
    id: 'learner' as const,
    label: "I'm a Learner",
    description: 'Access interactive lessons, take quizzes, track your learning journey, and achieve your goals.',
    icon: BookOpen,
    features: ['Interactive Lessons', 'Practice Quizzes', 'Progress Tracking'],
  },
  {
    id: 'school_admin' as const,
    label: "I'm a School Admin",
    description: 'Manage your institution, add teachers & students, track usage, and select institutional packages.',
    icon: Building2,
    features: ['User Management', 'Institutional Plans', 'Usage Analytics'],
  },
  {
    id: 'super_admin' as const,
    label: "I'm a Super Admin",
    description: 'Oversee the entire platform, manage schools, monitor financials, and access strategic insights.',
    icon: Shield,
    features: ['Platform Oversight', 'School Management', 'Financial Analytics'],
  },
];

const RoleStep: React.FC = () => {
  const { userRole, setUserRole, setCurrentStep } = useOnboarding();

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    setCurrentStep('signup');
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-xl lg:text-2xl font-bold text-foreground">
          How will you use Jesi AI?
        </h2>
        <p className="text-sm text-muted-foreground">
          Select your role to personalize your experience
        </p>
      </div>

      <div className="grid gap-2.5">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => handleRoleSelect(role.id)}
            className={`group relative px-4 py-3 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-medium ${
              userRole === role.id
                ? 'border-primary bg-primary/5 shadow-soft'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${
                userRole === role.id ? 'gradient-hero' : 'bg-muted group-hover:gradient-hero'
              }`}>
                <role.icon className={`w-5 h-5 ${
                  userRole === role.id ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary-foreground'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{role.label}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{role.description}</p>
              </div>
              <ArrowRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                userRole === role.id ? 'text-primary translate-x-1' : 'text-muted-foreground group-hover:translate-x-1'
              }`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleStep;
