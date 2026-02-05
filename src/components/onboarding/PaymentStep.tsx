import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowLeft, CreditCard, Smartphone, Lock, Shield, CheckCircle2 } from 'lucide-react';

const PaymentStep: React.FC = () => {
  const { selectedPlan, setCurrentStep } = useOnboarding();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo'>('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [momoNumber, setMomoNumber] = useState('');
  const [momoProvider, setMomoProvider] = useState('');

  const planDetails = {
    pro: { name: 'Pro', price: 25, tokens: '30,000' },
    premium: { name: 'Premium', price: 50, tokens: '80,000' },
  };

  const currentPlan = selectedPlan === 'pro' || selectedPlan === 'premium' 
    ? planDetails[selectedPlan] 
    : null;

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setCurrentStep('dashboard');
  };

  if (!currentPlan) {
    setCurrentStep('plans');
    return null;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentStep('plans')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to plans</span>
      </button>

      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          Complete Payment
        </h2>
        <p className="text-muted-foreground">
          Subscribe to {currentPlan.name} plan
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-muted/50 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-foreground">Order Summary</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">{currentPlan.name} Plan</p>
            <p className="text-sm text-muted-foreground">{currentPlan.tokens} AI Tokens/month</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">₵{currentPlan.price}</p>
            <p className="text-sm text-muted-foreground">/month</p>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label>Payment Method</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod('momo')}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              paymentMethod === 'momo'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Smartphone className={`w-6 h-6 ${paymentMethod === 'momo' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-sm font-medium">Mobile Money</span>
          </button>
          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              paymentMethod === 'card'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
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
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="password"
                placeholder="123"
              />
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-center gap-3 p-4 bg-success/10 rounded-xl">
        <Shield className="w-5 h-5 text-success" />
        <p className="text-sm text-success">
          Your payment is secured with 256-bit encryption
        </p>
      </div>

      <Button 
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full" 
        size="lg"
        variant="hero"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay ₵{currentPlan.price}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By completing this purchase, you agree to our Terms of Service and authorize 
        monthly charges until you cancel.
      </p>
    </div>
  );
};

export default PaymentStep;
