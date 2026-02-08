import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PasswordStep: React.FC = () => {
  const { signupData, setSignupData, setCurrentStep } = useOnboarding();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number', test: (p: string) => /\d/.test(p) },
  ];

  const handleChange = (field: string, value: string | boolean) => {
    setSignupData({ ...signupData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const password = signupData.password || '';
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const failedRequirements = passwordRequirements.filter(req => !req.test(password));
      if (failedRequirements.length > 0) {
        newErrors.password = 'Password does not meet all requirements';
      }
    }
    
    if (!signupData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!signupData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and policy';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);

    const { error } = await signUp(
      signupData.email!,
      signupData.password!,
      signupData.firstName!,
      signupData.lastName!,
      signupData.gender!
    );

    if (error) {
      toast({
        title: 'Account creation failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: 'Account created!',
      description: 'Please check your email for a verification code.',
    });

    setCurrentStep('verify');
    setIsSubmitting(false);
  };

  const password = signupData.password || '';

  return (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentStep('signup')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          Secure your account
        </h2>
        <p className="text-muted-foreground">
          Create a strong password to protect your account
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={signupData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {/* Password Requirements */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {passwordRequirements.map((req, index) => {
              const passed = req.test(password);
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 text-xs ${
                    password ? (passed ? 'text-success' : 'text-muted-foreground') : 'text-muted-foreground'
                  }`}
                >
                  {password ? (
                    passed ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-muted-foreground" />
                  )}
                  {req.label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={signupData.confirmPassword || ''}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={signupData.acceptTerms || false}
              onCheckedChange={(checked) => handleChange('acceptTerms', checked as boolean)}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
              I accept the{' '}
              <button className="text-primary hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button className="text-primary hover:underline">Privacy Policy</button>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-destructive ml-6">{errors.acceptTerms}</p>
          )}

          <div className="flex items-start gap-3">
            <Checkbox
              id="emails"
              checked={signupData.receiveEmails || false}
              onCheckedChange={(checked) => handleChange('receiveEmails', checked as boolean)}
              className="mt-0.5"
            />
            <label htmlFor="emails" className="text-sm text-muted-foreground leading-tight">
              I'd like to receive product updates and educational tips via email
            </label>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleSubmit} 
        className="w-full" 
        size="lg"
        variant="hero"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : null}
        Create Account
        {!isSubmitting && <ArrowRight className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export default PasswordStep;
