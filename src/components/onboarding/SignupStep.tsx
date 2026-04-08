import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const ROLE_COPY: Record<string, { heading: string; subheading: string }> = {
  teacher: {
    heading: 'Create your Teacher account',
    subheading: 'Start creating AI-powered lessons and quizzes today',
  },
  learner: {
    heading: 'Create your Learner account',
    subheading: 'Begin your personalized learning journey with Jesi AI',
  },
  school_admin: {
    heading: 'Create your Admin account',
    subheading: 'Set up your institution and manage your team',
  },
  super_admin: {
    heading: 'Create your Super Admin account',
    subheading: 'Get platform-wide access and oversight',
  },
};

const SignupStep: React.FC = () => {
  const { signupData, setSignupData, setCurrentStep, userRole } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const copy = ROLE_COPY[userRole || 'teacher'] || ROLE_COPY.teacher;

  const handleChange = (field: string, value: string) => {
    setSignupData({ ...signupData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signupData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!signupData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!signupData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    if (!signupData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      setCurrentStep('password');
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentStep('role')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          {copy.heading}
        </h2>
        <p className="text-muted-foreground">
          {copy.subheading}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={signupData.firstName || ''}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={errors.firstName ? 'border-destructive' : ''}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              value={signupData.lastName || ''}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={errors.lastName ? 'border-destructive' : ''}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={signupData.gender || ''}
            onValueChange={(value) => handleChange('gender', value)}
          >
            <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-xs text-destructive">{errors.gender}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={signupData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      <Button 
        onClick={handleContinue} 
        className="w-full" 
        size="lg"
        variant="hero"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button onClick={() => setCurrentStep('signin')} className="text-primary font-medium hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
};

export default SignupStep;
