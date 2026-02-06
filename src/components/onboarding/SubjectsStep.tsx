import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowLeft, ArrowRight, BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

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

const SubjectsStep: React.FC = () => {
  const { teacherProfile, setTeacherProfile, setCurrentStep, userRole } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const selectedSubjects = teacherProfile.subjects || [];

  const filteredSubjects = SUBJECTS.filter(subject =>
    subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubjectToggle = (subject: string) => {
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject];
    setTeacherProfile({ ...teacherProfile, subjects: newSubjects });
    if (error) setError('');
  };

  const handleContinue = () => {
    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }
    // Learners go to join class step, teachers go to profile
    if (userRole === 'learner') {
      setCurrentStep('student-join-class');
    } else {
      setCurrentStep('profile');
    }
  };

  const isLearner = userRole === 'learner';

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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          {isLearner ? 'What subjects are you learning?' : 'What subjects do you teach?'}
        </h2>
        <p className="text-muted-foreground">
          {isLearner 
            ? 'Select all the subjects you want to learn. This helps us personalize your learning experience.'
            : 'Select all the subjects you teach. This helps us personalize your lesson plans and resources.'}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected count */}
      {selectedSubjects.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Selected:</span>
          <div className="flex flex-wrap gap-1">
            {selectedSubjects.map((subject) => (
              <span
                key={subject}
                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Subject Grid */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-2">
          {filteredSubjects.map((subject) => {
            const isSelected = selectedSubjects.includes(subject);
            return (
              <button
                key={subject}
                onClick={() => handleSubjectToggle(subject)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleSubjectToggle(subject)}
                  className="pointer-events-none"
                />
                <span className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {subject}
                </span>
              </button>
            );
          })}
        </div>
        
        {filteredSubjects.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No subjects match your search
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        onClick={handleContinue}
        className="w-full"
        size="lg"
        variant="hero"
        disabled={selectedSubjects.length === 0}
      >
        Continue
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        You can always update your subjects later in settings
      </p>
    </div>
  );
};

export default SubjectsStep;
