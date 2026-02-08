import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlanType } from '@/types/onboarding';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Crown, Lock, Star, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const upgradePlans = [
  {
    id: 'pro' as PlanType,
    name: 'Pro',
    price: 25,
    currency: 'GHS',
    period: 'month',
    features: [
      'Unlimited Lesson Plans',
      'Quiz Generation',
      '30,000 tokens',
    ],
    highlight: true,
    badge: 'Popular',
  },
  {
    id: 'premium' as PlanType,
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

interface UpgradePromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({ open, onOpenChange }) => {
  const { updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async (planId: PlanType) => {
    setIsLoading(true);
    const { error } = await updateProfile({ selected_plan: planId });
    if (error) {
      toast({ title: 'Error', description: 'Failed to update plan.', variant: 'destructive' });
    } else {
      toast({ title: 'Plan Updated', description: `You are now on the ${planId === 'pro' ? 'Pro' : 'Premium'} plan.` });
      onOpenChange(false);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Upgrade to Continue</DialogTitle>
          <DialogDescription className="text-base">
            You've used your free trial lesson plan. Upgrade to Pro or Premium to unlock all features.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {upgradePlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 p-5 transition-all ${
                plan.highlight ? 'border-primary shadow-lg' : 'border-border'
              }`}
            >
              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${
                  plan.id === 'premium' ? 'gradient-premium text-foreground' : 'gradient-hero text-primary-foreground'
                }`}>
                  {plan.badge}
                </span>
              )}

              <div className="text-center mb-4">
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  plan.highlight ? 'gradient-hero text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {plan.id === 'pro' ? <Star className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
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
                variant={plan.highlight ? 'hero' : 'default'}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePromptModal;
