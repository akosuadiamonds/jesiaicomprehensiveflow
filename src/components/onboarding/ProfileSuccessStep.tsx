import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { CheckCircle2, Sparkles } from 'lucide-react';

const ProfileSuccessStep: React.FC = () => {
  const { signupData, setCurrentStep } = useOnboarding();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`space-y-8 text-center transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full gradient-accent flex items-center justify-center animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent-foreground" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          Profile Complete! 🎉
        </h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Welcome aboard, <span className="font-semibold text-foreground">{signupData.firstName}</span>! 
          Your teacher profile has been set up successfully.
        </p>
      </div>

      <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">What's next?</h3>
        <p className="text-sm text-muted-foreground">
          Choose a plan that fits your teaching needs. Start with a free trial 
          or unlock premium features right away.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
          <Sparkles className="w-4 h-4" />
          <span>5-day free trial available</span>
        </div>
      </div>

      <Button 
        onClick={() => setCurrentStep('plans')}
        className="w-full" 
        size="lg"
        variant="hero"
      >
        Choose Your Plan
      </Button>
    </div>
  );
};

export default ProfileSuccessStep;
