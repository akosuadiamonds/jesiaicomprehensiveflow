import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import { UserRole } from '@/types/onboarding';

const RoleStep: React.FC = () => {
  const { userRole, setUserRole, setCurrentStep } = useOnboarding();

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    if (role === 'teacher') {
      setCurrentStep('profile');
    } else {
      // For learners, go to subject selection then join class flow
      setCurrentStep('subjects');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          How will you use Jesi AI?
        </h2>
        <p className="text-muted-foreground">
          Select your role to personalize your experience
        </p>
      </div>

      <div className="grid gap-4">
        {/* Teacher Card */}
        <button
          onClick={() => handleRoleSelect('teacher')}
          className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:shadow-medium ${
            userRole === 'teacher'
              ? 'border-primary bg-primary/5 shadow-soft'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
              userRole === 'teacher'
                ? 'gradient-hero'
                : 'bg-muted group-hover:gradient-hero'
            }`}>
              <GraduationCap className={`w-7 h-7 ${
                userRole === 'teacher' ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary-foreground'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                I'm a Teacher
              </h3>
              <p className="text-sm text-muted-foreground">
                Create lesson plans, generate quizzes, track student progress, and more with AI-powered tools.
              </p>
            </div>
            <ArrowRight className={`w-5 h-5 mt-2 transition-transform ${
              userRole === 'teacher' ? 'text-primary translate-x-1' : 'text-muted-foreground group-hover:translate-x-1'
            }`} />
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 ml-[4.5rem]">
            {['Lesson Planning', 'Quiz Generation', 'Student Tracking'].map((feature) => (
              <span
                key={feature}
                className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
              >
                {feature}
              </span>
            ))}
          </div>
        </button>

        {/* Learner Card */}
        <button
          onClick={() => handleRoleSelect('learner')}
          className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:shadow-medium ${
            userRole === 'learner'
              ? 'border-primary bg-primary/5 shadow-soft'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
              userRole === 'learner'
                ? 'gradient-hero'
                : 'bg-muted group-hover:gradient-hero'
            }`}>
              <BookOpen className={`w-7 h-7 ${
                userRole === 'learner' ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary-foreground'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                I'm a Learner
              </h3>
              <p className="text-sm text-muted-foreground">
                Access interactive lessons, take quizzes, track your learning journey, and achieve your goals.
              </p>
            </div>
            <ArrowRight className={`w-5 h-5 mt-2 transition-transform ${
              userRole === 'learner' ? 'text-primary translate-x-1' : 'text-muted-foreground group-hover:translate-x-1'
            }`} />
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 ml-[4.5rem]">
            {['Interactive Lessons', 'Practice Quizzes', 'Progress Tracking'].map((feature) => (
              <span
                key={feature}
                className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium"
              >
                {feature}
              </span>
            ))}
          </div>
        </button>
      </div>
    </div>
  );
};

export default RoleStep;
