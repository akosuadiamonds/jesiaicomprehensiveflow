import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, ArrowRight, Phone, Loader2, BookOpen } from 'lucide-react';

const CLASS_GRADES = [
  'JHS 1', 'JHS 2', 'JHS 3',
  'SHS 1', 'SHS 2', 'SHS 3',
];

// GES curriculum subjects by level
const SUBJECTS_BY_LEVEL: Record<string, string[]> = {
  JHS: [
    'Mathematics',
    'English Language',
    'Science',
    'Social Studies',
    'ICT',
    'Creative Arts',
    'French',
    'Religious & Moral Education',
    'Ghanaian Language',
  ],
  SHS: [
    'Mathematics',
    'English Language',
    'Science',
    'Social Studies',
    'ICT',
    'History',
    'Geography',
    'French',
    'Religious & Moral Education',
    'Physical Education',
  ],
};

const getSubjectsForGrade = (grade: string): string[] => {
  if (grade.startsWith('JHS')) return SUBJECTS_BY_LEVEL.JHS;
  if (grade.startsWith('SHS')) return SUBJECTS_BY_LEVEL.SHS;
  return [];
};

const StudentProfileStep: React.FC = () => {
  const { setCurrentStep, setTeacherProfile, teacherProfile } = useOnboarding();
  const { updateProfile } = useAuth();
  const [parentContact, setParentContact] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const autoSubjects = classGrade ? getSubjectsForGrade(classGrade) : [];

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
    // Save profile with auto-assigned subjects - skip the subjects step entirely
    const { error } = await updateProfile({
      parent_contact: parentContact,
      class_grade: classGrade,
      subjects: autoSubjects,
    } as any);

    if (!error) {
      // Update onboarding context with subjects
      setTeacherProfile({ ...teacherProfile, subjects: autoSubjects });
      // Skip subjects step, go directly to join class
      setCurrentStep('student-join-class');
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

        {/* Auto-assigned subjects preview */}
        {autoSubjects.length > 0 && (
          <div className="space-y-2 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <Label className="text-sm font-medium text-primary">Your Subjects ({autoSubjects.length})</Label>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Based on the GES curriculum for {classGrade}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {autoSubjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="text-xs">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        )}

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
