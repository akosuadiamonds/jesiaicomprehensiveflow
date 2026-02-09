import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowLeft, Check, Crown, Sparkles, Users, GraduationCap } from 'lucide-react';

interface InstitutionPlan {
  id: 'pro_institution' | 'premium_institution';
  name: string;
  badge: string;
  studentPrice: number;
  teacherPrice: number;
  studentTokens: string;
  teacherTokens: string;
  features: string[];
  highlight?: boolean;
}

const PLANS: InstitutionPlan[] = [
  {
    id: 'pro_institution',
    name: 'Pro Institution',
    badge: 'Popular',
    studentPrice: 10,
    teacherPrice: 20,
    studentTokens: '20,000',
    teacherTokens: '30,000',
    highlight: true,
    features: [
      'GES Lesson Planning for all teachers',
      'Quiz & Test Generation',
      'Basic analytics & reporting',
      'Email support',
      'Classroom management',
    ],
  },
  {
    id: 'premium_institution',
    name: 'Premium Institution',
    badge: 'Best Value',
    studentPrice: 20,
    teacherPrice: 50,
    studentTokens: '50,000',
    teacherTokens: '80,000',
    features: [
      'Everything in Pro, plus:',
      'Private Classes & Monetization',
      'Advanced Student Tracking',
      'Incentives & Gamification',
      'Dedicated account manager',
      'Custom branding',
      'Priority support',
    ],
  },
];

const BULK_DISCOUNTS = [
  { min: 1, max: 100, rate: 0, label: '1 – 100 users' },
  { min: 101, max: 500, rate: 10, label: '101 – 500 users' },
  { min: 501, max: 1000, rate: 15, label: '501 – 1,000 users' },
  { min: 1001, max: Infinity, rate: 0, label: '1,000+ users', custom: true },
];

const AdminSelectPackageStep: React.FC = () => {
  const { setCurrentStep } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<'pro_institution' | 'premium_institution'>('pro_institution');
  const [teacherCount, setTeacherCount] = useState(5);
  const [studentCount, setStudentCount] = useState(50);

  const totalUsers = teacherCount + studentCount;
  const discount = BULK_DISCOUNTS.find(d => totalUsers >= d.min && totalUsers <= d.max);
  const discountRate = discount?.rate || 0;
  const isCustom = discount?.custom || false;

  const plan = PLANS.find(p => p.id === selectedPlan)!;
  const rawTotal = (teacherCount * plan.teacherPrice) + (studentCount * plan.studentPrice);
  const discountAmount = rawTotal * (discountRate / 100);
  const finalTotal = rawTotal - discountAmount;

  const handleContinue = () => {
    localStorage.setItem('jesi_institution_package', JSON.stringify({
      plan: selectedPlan,
      teacherCount,
      studentCount,
      totalUsers,
      discountRate,
      monthlyTotal: finalTotal,
    }));
    if (isCustom) {
      // For 1000+ users, show contact form (for now, proceed to payment)
    }
    setCurrentStep('admin-payment');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => setCurrentStep('admin-school-details')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          Select Institutional Package
        </h2>
        <p className="text-muted-foreground">
          Choose the right plan for your school
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {PLANS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlan(p.id)}
            className={`relative rounded-2xl border-2 p-6 transition-all duration-300 text-left ${
              selectedPlan === p.id
                ? 'border-primary bg-primary/5 shadow-medium'
                : 'border-border hover:border-primary/50'
            }`}
          >
            {p.badge && (
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold ${
                p.highlight ? 'gradient-hero text-primary-foreground' : 'gradient-premium text-foreground'
              }`}>
                {p.badge}
              </div>
            )}

            <div className="space-y-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                p.highlight ? 'gradient-hero text-primary-foreground' : 'gradient-premium text-foreground'
              }`}>
                {p.highlight ? <Sparkles className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
              </div>

              <h3 className="text-xl font-bold text-foreground">{p.name}</h3>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">GH₵ {p.teacherPrice}/teacher</span>
                  <span className="text-muted-foreground">({p.teacherTokens} tokens)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">GH₵ {p.studentPrice}/student</span>
                  <span className="text-muted-foreground">({p.studentTokens} tokens)</span>
                </div>
              </div>

              <ul className="space-y-2">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </button>
        ))}
      </div>

      {/* User Count Inputs */}
      <div className="bg-muted/50 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Configure Your Package</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="teachers">Number of Teachers</Label>
            <Input
              id="teachers"
              type="number"
              min={1}
              value={teacherCount}
              onChange={(e) => setTeacherCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="students">Number of Students</Label>
            <Input
              id="students"
              type="number"
              min={1}
              value={studentCount}
              onChange={(e) => setStudentCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
        </div>

        {/* Bulk Discount Info */}
        <div className="border border-border rounded-xl p-4 space-y-2">
          <h4 className="text-sm font-medium text-foreground">Bulk Discount Schedule</h4>
          <div className="space-y-1">
            {BULK_DISCOUNTS.map((d, i) => (
              <div key={i} className={`flex justify-between text-sm px-2 py-1 rounded ${
                totalUsers >= d.min && totalUsers <= d.max ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
              }`}>
                <span>{d.label}</span>
                <span>{d.custom ? 'Contact Sales' : `${d.rate}% off`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{teacherCount} teachers × GH₵ {plan.teacherPrice}</span>
            <span>GH₵ {teacherCount * plan.teacherPrice}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{studentCount} students × GH₵ {plan.studentPrice}</span>
            <span>GH₵ {studentCount * plan.studentPrice}</span>
          </div>
          {discountRate > 0 && (
            <div className="flex justify-between text-sm text-success font-medium">
              <span>Bulk discount ({discountRate}%)</span>
              <span>-GH₵ {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
            <span>Monthly Total</span>
            <span>GH₵ {finalTotal.toFixed(2)}/mo</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleContinue}
        className="w-full"
        size="lg"
        variant="hero"
        disabled={isCustom}
      >
        {isCustom ? 'Contact Sales for Enterprise Pricing' : `Continue to Payment — GH₵ ${finalTotal.toFixed(2)}/mo`}
      </Button>
    </div>
  );
};

export default AdminSelectPackageStep;
