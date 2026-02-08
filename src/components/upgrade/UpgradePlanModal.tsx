import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlanType, Plan } from '@/types/onboarding';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Crown, Star, Zap, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    currency: 'GHS',
    period: '5 days',
    features: [
      'GES Lesson Planning',
      'Quiz Generation',
      'Basic Analytics',
      '5,000 tokens',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 25,
    currency: 'GHS',
    period: 'month',
    features: [
      'Everything in Free',
      'Unlimited Lesson Plans',
      'Quiz Generation',
      '30,000 tokens',
    ],
    highlight: true,
    badge: 'Popular',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 50,
    currency: 'GHS',
    period: 'month',
    features: [
      'Everything in Pro',
      'Private Classes',
      'Student Tracking',
      'Incentives & Rewards',
      '80,000 tokens',
    ],
    badge: 'Best Value',
  },
];

interface UpgradePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredPlan?: 'pro' | 'premium';
  featureName?: string;
}

const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({ open, onOpenChange, requiredPlan, featureName }) => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const selectedPlan = profile?.selected_plan || 'free';

  const handleSelectPlan = async (planId: PlanType) => {
    setIsLoading(true);
    const { error } = await updateProfile({ selected_plan: planId });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update plan. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Plan Updated',
        description: `You are now on the ${plans.find(p => p.id === planId)?.name} plan.`,
      });
      onOpenChange(false);
    }
    setIsLoading(false);
  };

  const getPlanIcon = (planId: PlanType) => {
    switch (planId) {
      case 'free':
        return <Zap className="w-6 h-6" />;
      case 'pro':
        return <Star className="w-6 h-6" />;
      case 'premium':
        return <Crown className="w-6 h-6" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Change Your Plan</DialogTitle>
          <DialogDescription>
            Select the plan that best fits your teaching needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {plans.map((plan) => {
            const isCurrentPlan = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`
                  relative rounded-xl border-2 p-5 transition-all
                  ${plan.highlight ? 'border-primary shadow-lg' : 'border-border'}
                  ${isCurrentPlan ? 'ring-2 ring-primary ring-offset-2' : ''}
                `}
              >
                {plan.badge && (
                  <span className={`
                    absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold
                    ${plan.id === 'premium' ? 'gradient-premium text-foreground' : 'gradient-hero text-primary-foreground'}
                  `}>
                    {plan.badge}
                  </span>
                )}

                <div className="text-center mb-4">
                  <div className={`
                    mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3
                    ${plan.highlight ? 'gradient-hero text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  `}>
                    {getPlanIcon(plan.id)}
                  </div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{plan.currency} {plan.price}</span>
                    <span className="text-muted-foreground text-sm">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  variant={isCurrentPlan ? 'outline' : plan.highlight ? 'hero' : 'default'}
                  className="w-full"
                  disabled={isCurrentPlan || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    'Select Plan'
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePlanModal;
