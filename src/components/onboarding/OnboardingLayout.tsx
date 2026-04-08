import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

const ROLE_BRANDING: Record<string, { tagline: string; heading: string; description: string; bullets?: string[]; footer?: string }> = {
  teacher: {
    tagline: 'AI-Powered Teaching Assistant',
    heading: 'Teach smarter.\nTrack progress.\nImprove outcomes.',
    description: 'Join thousands of educators using AI to create engaging lessons, generate quizzes, and track student progress effortlessly.',
  },
  learner: {
    tagline: 'AI-Powered Learning Companion',
    heading: 'Supercharge Your\nLearning Journey',
    description: 'Interactive lessons, practice quizzes, and personalized progress tracking — all powered by AI to help you succeed.',
  },
  school_admin: {
    tagline: 'AI-Powered School Management',
    heading: 'Run a Smarter School',
    description: 'Track teaching, monitor learning, and improve performance across your entire school.',
    bullets: [
      'Track teacher activity and effectiveness',
      'Monitor curriculum coverage in real time',
      'Identify struggling classes and students early',
      'Improve school-wide academic performance',
      'Make data-driven academic decisions',
    ],
    footer: 'Built for modern schools focused on performance and accountability',
  },
  super_admin: {
    tagline: 'AI-Powered Platform Oversight',
    heading: 'Oversee the\nEntire Platform',
    description: 'Monitor schools, financials, and strategic insights across the entire Jesi AI ecosystem.',
  },
};

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  showProgress = true,
  currentStep = 1,
  totalSteps = 6,
}) => {
  let branding = ROLE_BRANDING.teacher;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { userRole } = useOnboarding();
    if (userRole && ROLE_BRANDING[userRole]) {
      branding = ROLE_BRANDING[userRole];
    }
  } catch {
    // OnboardingProvider may not be available
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <img src={logo} alt="Jesi AI" className="h-10 object-contain brightness-0 invert" />
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">{branding.tagline}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight whitespace-pre-line">
              {branding.heading}
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              {branding.description}
            </p>
            {branding.bullets && (
              <ul className="space-y-2">
                {branding.bullets.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-primary-foreground/90">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {branding.footer ? (
            <p className="text-sm text-primary-foreground/60 italic">{branding.footer}</p>
          ) : (
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-foreground">10K+</p>
                <p className="text-sm text-primary-foreground/70">Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-foreground">50K+</p>
                <p className="text-sm text-primary-foreground/70">Lessons Created</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-foreground">95%</p>
                <p className="text-sm text-primary-foreground/70">Satisfaction</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Jesi AI" className="h-8 object-contain" />
          </div>
        </div>
        
        {/* Progress Bar */}
        {showProgress && (
          <div className="px-6 lg:px-12 pt-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full gradient-hero transition-all duration-500 ease-out rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md animate-fade-in">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
