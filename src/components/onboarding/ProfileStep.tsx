import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, ArrowRight, Phone, Building2, Loader2 } from 'lucide-react';

const ProfileStep: React.FC = () => {
  const { teacherProfile, setTeacherProfile, setCurrentStep } = useOnboarding();
  const { updateProfile } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setTeacherProfile({ ...teacherProfile, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!teacherProfile.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^(\+233|0)\d{9}$/.test(teacherProfile.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid Ghana phone number';
    }
    
    if (!teacherProfile.schoolName?.trim()) {
      newErrors.schoolName = 'School name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setIsSubmitting(true);
      
      // Save to database
      const { error } = await updateProfile({
        phone_number: teacherProfile.phoneNumber,
        school_name: teacherProfile.schoolName,
        subjects: teacherProfile.subjects,
      });

      if (!error) {
        setCurrentStep('profile-success');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentStep('subjects')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          Complete your profile
        </h2>
        <p className="text-muted-foreground">
          Tell us a bit more about yourself
        </p>
      </div>

      {/* Selected subjects summary */}
      {teacherProfile.subjects && teacherProfile.subjects.length > 0 && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground mb-2">Teaching subjects:</p>
          <div className="flex flex-wrap gap-2">
            {teacherProfile.subjects.map((subject) => (
              <span
                key={subject}
                className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="0244 123 4567"
              value={teacherProfile.phoneNumber || ''}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              className={`pl-10 ${errors.phoneNumber ? 'border-destructive' : ''}`}
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-xs text-destructive">{errors.phoneNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="school">School Name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="school"
              placeholder="Enter your school name"
              value={teacherProfile.schoolName || ''}
              onChange={(e) => handleChange('schoolName', e.target.value)}
              className={`pl-10 ${errors.schoolName ? 'border-destructive' : ''}`}
            />
          </div>
          {errors.schoolName && (
            <p className="text-xs text-destructive">{errors.schoolName}</p>
          )}
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
        Complete Profile
        {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
    </div>
  );
};

export default ProfileStep;
