import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowLeft, ArrowRight, Phone, Building2 } from 'lucide-react';

const SUBJECTS = [
  'Mathematics',
  'English Language',
  'Science',
  'Social Studies',
  'ICT',
  'Creative Arts',
  'French',
  'Religious & Moral Education',
  'Physical Education',
  'Ghanaian Language',
  'History',
  'Geography',
];

const ProfileStep: React.FC = () => {
  const { teacherProfile, setTeacherProfile, setCurrentStep } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setTeacherProfile({ ...teacherProfile, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubjectToggle = (subject: string) => {
    const currentSubjects = teacherProfile.subjects || [];
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter(s => s !== subject)
      : [...currentSubjects, subject];
    setTeacherProfile({ ...teacherProfile, subjects: newSubjects });
    if (errors.subjects) {
      setErrors({ ...errors, subjects: '' });
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
    
    if (!teacherProfile.subjects?.length) {
      newErrors.subjects = 'Please select at least one subject';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      setCurrentStep('profile-success');
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
          Complete your profile
        </h2>
        <p className="text-muted-foreground">
          Tell us more about yourself to personalize your experience
        </p>
      </div>

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

        <div className="space-y-3">
          <Label>Subjects You Teach</Label>
          <p className="text-xs text-muted-foreground">Select all that apply</p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
            {SUBJECTS.map((subject) => (
              <div
                key={subject}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={subject}
                  checked={teacherProfile.subjects?.includes(subject) || false}
                  onCheckedChange={() => handleSubjectToggle(subject)}
                />
                <label
                  htmlFor={subject}
                  className="text-sm text-foreground cursor-pointer leading-tight"
                >
                  {subject}
                </label>
              </div>
            ))}
          </div>
          {errors.subjects && (
            <p className="text-xs text-destructive">{errors.subjects}</p>
          )}
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        className="w-full" 
        size="lg"
        variant="hero"
      >
        Complete Profile
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ProfileStep;
