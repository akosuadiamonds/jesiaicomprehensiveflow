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
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, ArrowRight, Phone, GraduationCap, Loader2 } from 'lucide-react';

const CLASS_GRADES = [
  'JHS 1', 'JHS 2', 'JHS 3',
  'SHS 1', 'SHS 2', 'SHS 3',
];

const StudentProfileStep: React.FC = () => {
  const { setCurrentStep } = useOnboarding();
  const { updateProfile } = useAuth();
  const [parentContact, setParentContact] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!parentContact.trim()) {
      newErrors.parentContact = 'Parent/guardian phone number is required';
    } else if (!/^(\+233|0)\d{9}$/.test(parentContact.replace(/\s/g, ''))) {
      newErrors.parentContact = 'Please enter a valid Ghana phone number';
    }

    if (!classGrade) {
      newErrors.classGrade = 'Please select your class';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const { error } = await updateProfile({
      parent_contact: parentContact,
      class_grade: classGrade,
    } as any);

    if (!error) {
      setCurrentStep('subjects');
    }
    setIsSubmitting(false);
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
          Tell us about yourself
        </h2>
        <p className="text-muted-foreground">
          We need a few details to set up your learning account
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="classGrade">Your Class / Grade</Label>
          <Select value={classGrade} onValueChange={(v) => { setClassGrade(v); if (errors.classGrade) setErrors({ ...errors, classGrade: '' }); }}>
            <SelectTrigger className={errors.classGrade ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select your class" />
            </SelectTrigger>
            <SelectContent>
              {CLASS_GRADES.map((grade) => (
                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.classGrade && (
            <p className="text-xs text-destructive">{errors.classGrade}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentContact">Parent / Guardian Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="parentContact"
              type="tel"
              placeholder="0244 123 4567"
              value={parentContact}
              onChange={(e) => { setParentContact(e.target.value); if (errors.parentContact) setErrors({ ...errors, parentContact: '' }); }}
              className={`pl-10 ${errors.parentContact ? 'border-destructive' : ''}`}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            We'll only contact them for account verification purposes
          </p>
          {errors.parentContact && (
            <p className="text-xs text-destructive">{errors.parentContact}</p>
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
        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Continue
        {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
      </Button>
    </div>
  );
};

export default StudentProfileStep;
