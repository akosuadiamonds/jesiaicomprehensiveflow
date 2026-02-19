import React from 'react';
import { Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  showProgress = true,
  currentStep = 1,
  totalSteps = 6,
}) => {
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
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">AI-Powered Teaching Assistant</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight">
              Transform Your
              <br />
              Teaching Experience
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Join thousands of educators using AI to create engaging lessons, 
              generate quizzes, and track student progress effortlessly.
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground">10K+</p>
              <p className="text-sm text-primary-foreground/70">Teachers</p>
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
