import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Star } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { studentPlans } from '@/types/student';
import { toast } from 'sonner';

const StudentPlansStep: React.FC = () => {
  const { setCurrentStep, selectedPlan, setSelectedPlan } = useOnboarding();
  const { updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async (planId: 'free' | 'pro' | 'premium') => {
    setSelectedPlan(planId);
    setIsLoading(true);

    if (planId === 'free') {
      // Free plan - save immediately and go to dashboard
      try {
        const { error } = await updateProfile({ selected_plan: planId });
        if (error) throw error;

        toast.success(`🎉 Welcome to Jesi AI!`, {
          description: `You're now on the ${studentPlans.find(p => p.id === planId)?.name} plan!`,
        });
        
        setCurrentStep('dashboard');
      } catch (error) {
        console.error('Error updating plan:', error);
        toast.error('Failed to save plan. Please try again.');
      }
    } else {
      // Paid plans - go to payment first
      setCurrentStep('payment');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Choose Your Learning Plan
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Pick the plan that fits your learning goals. You can upgrade anytime!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {studentPlans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative transition-all duration-300 hover:shadow-xl cursor-pointer ${
              plan.highlight 
                ? 'border-2 border-amber-400 shadow-lg scale-105' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleSelectPlan(plan.id)}
          >
            {plan.badge && (
              <Badge 
                className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500"
              >
                <Star className="w-3 h-3 mr-1" />
                {plan.badge}
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <div className="text-4xl mb-2">
                {plan.id === 'free' ? '🌱' : plan.id === 'pro' ? '🏆' : '👑'}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">
                  {plan.price === 0 ? 'Free' : `${plan.currency} ${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground text-sm">/{plan.period}</span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full ${
                  plan.highlight 
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600' 
                    : ''
                }`}
                variant={plan.highlight ? 'default' : 'outline'}
                disabled={isLoading}
              >
                {isLoading && selectedPlan === plan.id ? (
                  'Setting up...'
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {plan.price === 0 ? 'Start Free' : 'Get Started'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        All plans include a 7-day money-back guarantee. No questions asked! 💯
      </p>
    </div>
  );
};

export default StudentPlansStep;
