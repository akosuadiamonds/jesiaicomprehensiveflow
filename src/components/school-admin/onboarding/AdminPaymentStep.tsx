import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CreditCard, Smartphone, Lock, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const momoSchema = z.object({
  provider: z.string().min(1, 'Please select a provider'),
  number: z.string().min(10).max(15).regex(/^[0-9\s]+$/),
});

const cardSchema = z.object({
  cardNumber: z.string().min(16).max(19).regex(/^[0-9\s]+$/),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/),
  cvv: z.string().min(3).max(4).regex(/^[0-9]+$/),
});

const AdminPaymentStep: React.FC = () => {
  const { setCurrentStep } = useOnboarding();
  const { user, updateProfile, refreshProfile } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo'>('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [momoNumber, setMomoNumber] = useState('');
  const [momoProvider, setMomoProvider] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const packageData = JSON.parse(localStorage.getItem('jesi_institution_package') || '{}');
  const schoolData = JSON.parse(localStorage.getItem('jesi_institution_details') || '{}');
  const monthlyTotal = packageData.monthlyTotal || 0;
  const planName = packageData.plan === 'premium_institution' ? 'Premium Institution' : 'Pro Institution';

  const isFormValid = useMemo(() => {
    if (paymentMethod === 'momo') {
      return momoSchema.safeParse({ provider: momoProvider, number: momoNumber }).success;
    }
    return cardSchema.safeParse({ cardNumber, expiry, cvv }).success;
  }, [paymentMethod, momoProvider, momoNumber, cardNumber, expiry, cvv]);

  const handlePayment = async () => {
    if (!user) return;
    setIsProcessing(true);

    // Simulate payment
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      // 1. Upsert user_role first so RLS policies work
      const { error: roleError } = await supabase.from('user_roles' as any).upsert(
        { user_id: user.id, role: 'school_admin' },
        { onConflict: 'user_id,role' }
      );
      if (roleError) {
        console.error('Role upsert error:', roleError);
        // Try insert if upsert fails
        await supabase.from('user_roles' as any).insert({
          user_id: user.id,
          role: 'school_admin',
        });
      }

      // 2. Create institution
      const { data: institution, error: instError } = await supabase
        .from('institutions' as any)
        .insert({
          name: schoolData.name,
          address: schoolData.address,
          city: schoolData.city,
          region: schoolData.region,
          phone: schoolData.phone,
          email: schoolData.email,
          selected_plan: packageData.plan,
          total_teacher_slots: packageData.teacherCount,
          total_student_slots: packageData.studentCount,
          created_by: user.id,
        })
        .select()
        .single();

      if (instError) throw instError;

      // 3. Add self as admin member
      const { error: memberError } = await supabase.from('institution_members' as any).insert({
        institution_id: (institution as any).id,
        user_id: user.id,
        member_role: 'admin',
        added_by: user.id,
      });
      if (memberError) console.error('Member insert error:', memberError);

      // 4. Update profile
      await updateProfile({
        selected_plan: packageData.plan,
        user_role: 'school_admin',
        school_name: schoolData.name,
        phone_number: schoolData.phone,
        subjects: ['Administration'],
      });

      await refreshProfile();
      setPaymentSuccess(true);
      toast.success('🎉 Payment Successful!', { description: `Welcome to ${planName}!` });

      // Clean up localStorage
      localStorage.removeItem('jesi_institution_details');
      localStorage.removeItem('jesi_institution_package');

      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep('dashboard');
    } catch (error) {
      console.error('Error setting up institution:', error);
      toast.error('Failed to set up institution. Please try again.');
    }

    setIsProcessing(false);
  };

  if (paymentSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
          <p className="text-muted-foreground">Setting up your institution...</p>
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentStep('admin-select-package')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to package</span>
      </button>

      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Complete Payment</h2>
        <p className="text-muted-foreground">Subscribe to {planName}</p>
      </div>

      {/* Order Summary */}
      <div className="bg-muted/50 rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-foreground">Order Summary</h3>
        <div className="text-sm space-y-1 text-muted-foreground">
          <p>{schoolData.name}</p>
          <p>{packageData.teacherCount} teachers + {packageData.studentCount} students</p>
          {packageData.discountRate > 0 && (
            <p className="text-success font-medium">{packageData.discountRate}% bulk discount applied</p>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="font-medium text-foreground">{planName}</p>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">GH₵ {monthlyTotal.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">/month</p>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-3">
        <Label>Payment Method</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod('momo')}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              paymentMethod === 'momo' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <Smartphone className={`w-6 h-6 ${paymentMethod === 'momo' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-sm font-medium">Mobile Money</span>
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-sm font-medium">Card</span>
          </button>
        </div>
      </div>

      {/* Payment Form */}
      {paymentMethod === 'momo' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Provider</Label>
            <div className="grid grid-cols-3 gap-2">
              {['MTN', 'Vodafone', 'AirtelTigo'].map((provider) => (
                <button
                  key={provider}
                  onClick={() => setMomoProvider(provider)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    momoProvider === provider
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50 text-muted-foreground'
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="momoNumber">Mobile Money Number</Label>
            <Input
              id="momoNumber"
              type="tel"
              placeholder="0244 123 4567"
              value={momoNumber}
              onChange={(e) => setMomoNumber(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input id="cardNumber" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input id="expiry" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" type="password" placeholder="123" value={cvv} onChange={(e) => setCvv(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 p-4 bg-success/10 rounded-xl">
        <Shield className="w-5 h-5 text-success" />
        <p className="text-sm text-success">Your payment is secured with 256-bit encryption</p>
      </div>

      <Button onClick={handlePayment} disabled={isProcessing || !isFormValid} className="w-full" size="lg" variant="hero">
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay GH₵ {monthlyTotal.toFixed(2)}
          </>
        )}
      </Button>
    </div>
  );
};

export default AdminPaymentStep;
