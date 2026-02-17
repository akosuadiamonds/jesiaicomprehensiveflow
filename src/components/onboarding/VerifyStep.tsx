import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mail, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DEMO_OTP = '123456';

const VerifyStep: React.FC = () => {
  const { signupData, setCurrentStep } = useOnboarding();
  const { toast } = useToast();
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [autoFilled, setAutoFilled] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-fill OTP after a brief delay to simulate receiving the code
  useEffect(() => {
    if (autoFilled) return;
    const timer = setTimeout(() => {
      const demoDigits = DEMO_OTP.split('');
      setOtpValues(demoDigits);
      setAutoFilled(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [autoFilled]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);

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
    
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResend = async () => {
    setIsResending(true);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: signupData.email!,
    });

    if (error) {
      toast({
        title: 'Failed to resend code',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Code resent',
        description: 'A new verification code has been sent to your email.',
      });
    }
    
    setIsResending(false);
    setResendTimer(60);
    setOtpValues(['', '', '', '', '', '']);
  };

  const handleVerify = async () => {
    const fullOtp = otpValues.join('');
    if (fullOtp.length !== 6) return;

    setIsVerifying(true);

    // For demo: accept the demo OTP and sign in with the user's credentials
    if (fullOtp === DEMO_OTP) {
      // Sign in with the credentials used during signup to establish a session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: signupData.email!,
        password: signupData.password!,
      });

      if (signInError) {
        // If sign-in fails, try the real OTP verification as fallback
        const { error } = await supabase.auth.verifyOtp({
          email: signupData.email!,
          token: fullOtp,
          type: 'signup',
        });

        if (error) {
          toast({
            title: 'Verification failed',
            description: error.message,
            variant: 'destructive',
          });
          setIsVerifying(false);
          return;
        }
      }
    } else {
      // Real OTP verification for non-demo codes
      const { error } = await supabase.auth.verifyOtp({
        email: signupData.email!,
        token: fullOtp,
        type: 'signup',
      });

      if (error) {
        toast({
          title: 'Verification failed',
          description: error.message,
          variant: 'destructive',
        });
        setIsVerifying(false);
        return;
      }
    }

    toast({
      title: 'Email verified!',
      description: 'Your account has been verified successfully.',
    });

    setCurrentStep('role');
    setIsVerifying(false);
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
        disabled={!isComplete || isVerifying}
        className="w-full" 
        size="lg"
        variant="hero"
      >
        {isVerifying ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : null}
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
