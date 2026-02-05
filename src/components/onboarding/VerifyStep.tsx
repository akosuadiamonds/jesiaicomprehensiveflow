import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';

const VerifyStep: React.FC = () => {
  const { signupData, otp, setOtp, setCurrentStep } = useOnboarding();
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);
    setOtp(newValues.join(''));

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newValues = [...otpValues];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newValues[index] = char;
    });
    setOtpValues(newValues);
    setOtp(newValues.join(''));
    
    // Focus the appropriate input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResend = async () => {
    setIsResending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsResending(false);
    setResendTimer(60);
    setOtpValues(['', '', '', '', '', '']);
  };

  const handleVerify = () => {
    const fullOtp = otpValues.join('');
    if (fullOtp.length === 6) {
      // In a real app, verify OTP here
      setCurrentStep('role');
    }
  };

  const isComplete = otpValues.every(v => v !== '');

  return (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentStep('password')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary-foreground" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          Verify your email
        </h2>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to
        </p>
        <p className="font-medium text-foreground">
          {signupData.email || 'your@email.com'}
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {otpValues.map((value, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-14 text-center text-xl font-semibold rounded-lg border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-ring focus:outline-none transition-all"
          />
        ))}
      </div>

      <Button 
        onClick={handleVerify}
        disabled={!isComplete}
        className="w-full" 
        size="lg"
        variant="hero"
      >
        Verify Email
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResend}
          disabled={resendTimer > 0 || isResending}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
        >
          {isResending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Resending...
            </>
          ) : resendTimer > 0 ? (
            `Resend in ${resendTimer}s`
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Resend Code
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VerifyStep;
