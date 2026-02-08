import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlanType, Plan } from '@/types/onboarding';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Crown, Star, Zap, Loader2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

const planRank: Record<PlanType, number> = { free: 0, pro: 1, premium: 2 };

const downgradeWarnings: Record<string, string[]> = {
  'premium-pro': ['Private Classes will be deactivated', 'Student Tracking disabled', 'Monetization features removed', 'Tokens reduced to 30,000/month'],
  'premium-free': ['All paid features will be locked', 'Private Classes deactivated', 'Limited to 1 lesson plan', 'Tokens reduced to 5,000'],
  'pro-free': ['All paid features will be locked', 'Limited to 1 lesson plan', 'Tokens reduced to 5,000'],
};

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
  const [downgradeTarget, setDowngradeTarget] = useState<PlanType | null>(null);

  const selectedPlan = (profile?.selected_plan || 'free') as PlanType;

  const isDowngrade = (targetId: PlanType) => planRank[targetId] < planRank[selectedPlan];

  const handleSelectPlan = async (planId: PlanType) => {
    if (isDowngrade(planId)) {
      setDowngradeTarget(planId);
      return;
    }
    await executePlanChange(planId);
  };

  const executePlanChange = async (planId: PlanType) => {
    setIsLoading(true);
    const { error } = await updateProfile({ selected_plan: planId });

    if (error) {
      toast({ title: 'Error', description: 'Failed to update plan. Please try again.', variant: 'destructive' });
    } else {
      const isDown = planRank[planId] < planRank[selectedPlan];
      toast({
        title: isDown ? 'Plan Downgraded' : 'Plan Updated',
        description: `You are now on the ${plans.find(p => p.id === planId)?.name} plan.`,
      });
      onOpenChange(false);
    }
    setIsLoading(false);
    setDowngradeTarget(null);
  };

  const getPlanIcon = (planId: PlanType) => {
    switch (planId) {
      case 'free': return <Zap className="w-6 h-6" />;
      case 'pro': return <Star className="w-6 h-6" />;
      case 'premium': return <Crown className="w-6 h-6" />;
    }
  };

  const getButtonLabel = (planId: PlanType, isCurrent: boolean) => {
    if (isCurrent) return 'Current Plan';
    if (isDowngrade(planId)) return 'Downgrade';
    return 'Upgrade';
  };

  const warningKey = downgradeTarget ? `${selectedPlan}-${downgradeTarget}` : '';
  const warnings = downgradeWarnings[warningKey] || [];

  return (
    <>
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
              const isDown = isDowngrade(plan.id);
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
                    variant={isCurrentPlan ? 'outline' : isDown ? 'destructive' : plan.highlight ? 'hero' : 'default'}
                    className="w-full"
                    disabled={isCurrentPlan || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      getButtonLabel(plan.id, isCurrentPlan)
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!downgradeTarget} onOpenChange={(o) => !o && setDowngradeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirm Downgrade
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Are you sure you want to downgrade from <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong> to <strong>{plans.find(p => p.id === downgradeTarget)?.name}</strong>?
                </p>
                {warnings.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-destructive mb-2">You will lose access to:</p>
                    <ul className="space-y-1">
                      {warnings.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-destructive mt-0.5">•</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Keep Current Plan</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => downgradeTarget && executePlanChange(downgradeTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Downgrade'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UpgradePlanModal;
