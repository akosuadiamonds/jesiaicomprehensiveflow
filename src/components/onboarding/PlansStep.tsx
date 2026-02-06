import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plan, PlanType } from '@/types/onboarding';
import { Check, Sparkles, Crown, Zap, ArrowLeft, Loader2 } from 'lucide-react';

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    currency: '₵',
    period: '5 days',
    badge: '5 Days',
    features: [
      'Full access to all features',
      'Create up to 10 lesson plans',
      'Generate unlimited quizzes',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 25,
    currency: '₵',
    period: '/month',
    tokens: 30000,
    highlight: true,
    badge: 'Most Popular',
    features: [
      'GES Lesson Planning',
      'Quiz Generation',
      '30,000 AI Tokens/month',
      'Priority support',
      'Export to PDF/Word',
      'Lesson templates library',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 50,
    currency: '₵',
    period: '/month',
    tokens: 80000,
    badge: 'Best Value',
    features: [
      'Everything in Pro, plus:',
      'Create Private Classes',
      'Student Tracking & Analytics',
      'Incentives & Gamification',
      '80,000 AI Tokens/month',
      'Dedicated account manager',
      'Custom branding',
    ],
  },
];

const PlansStep: React.FC = () => {
  const { selectedPlan, setSelectedPlan, setCurrentStep } = useOnboarding();
  const { updateProfile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);

  const handleSelectPlan = async (planId: PlanType) => {
    setIsLoading(true);
    setLoadingPlan(planId);
    setSelectedPlan(planId);
    
    if (planId === 'free') {
      // Free plan - save immediately and go to dashboard
      await updateProfile({ selected_plan: planId });
      await refreshProfile();
      setCurrentStep('dashboard');
    } else {
      // Paid plans - go to payment first, don't save plan yet
      setCurrentStep('payment');
    }
    
    setIsLoading(false);
    setLoadingPlan(null);
  };

  const getIcon = (planId: PlanType) => {
    switch (planId) {
      case 'free':
        return <Zap className="w-6 h-6" />;
      case 'pro':
        return <Sparkles className="w-6 h-6" />;
      case 'premium':
        return <Crown className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => setCurrentStep('profile-success')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          Choose your plan
        </h2>
        <p className="text-muted-foreground">
          Select the perfect plan for your teaching journey
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-6 transition-all duration-300 ${
              plan.highlight
                ? 'border-primary bg-primary/5 shadow-medium'
                : 'border-border hover:border-primary/50 hover:shadow-soft'
            }`}
          >
            {plan.badge && (
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${
                plan.highlight
                  ? 'gradient-hero text-primary-foreground'
                  : plan.id === 'premium'
                  ? 'gradient-premium text-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {plan.badge}
              </div>
            )}

            <div className="text-center space-y-4 mb-6">
              <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center ${
                plan.highlight
                  ? 'gradient-hero text-primary-foreground'
                  : plan.id === 'premium'
                  ? 'gradient-premium text-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {getIcon(plan.id)}
              </div>
              
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              
              <div className="flex items-baseline justify-center gap-1">
                {plan.price === 0 ? (
                  <span className="text-3xl font-bold text-foreground">Free</span>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground">{plan.currency}</span>
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </>
                )}
              </div>
              
              {plan.tokens && (
                <p className="text-sm text-primary font-medium">
                  {plan.tokens.toLocaleString()} AI Tokens
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSelectPlan(plan.id)}
              variant={plan.highlight ? 'hero' : plan.id === 'premium' ? 'premium' : 'outline'}
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {loadingPlan === plan.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                plan.price === 0 ? 'Start Free Trial' : 'Get Started'
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansStep;
