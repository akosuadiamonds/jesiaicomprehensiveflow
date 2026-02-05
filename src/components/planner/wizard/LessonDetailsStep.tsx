import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, BookOpen, Clock, Calendar } from 'lucide-react';
import { LessonPlanFormData } from '@/types/lesson';
import { useOnboarding } from '@/contexts/OnboardingContext';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const allLearningAreas = [
  'English Language', 
  'Mathematics', 
  'Science', 
  'Social Studies', 
  'Creative Arts', 
  'Physical Education', 
  'ICT', 
  'French', 
  'Ghanaian Language', 
  'Religious & Moral Education'
];

interface LessonDetailsStepProps {
  formData: LessonPlanFormData;
  onChange: (field: keyof LessonPlanFormData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const LessonDetailsStep: React.FC<LessonDetailsStepProps> = ({ formData, onChange, onNext, onBack }) => {
  const { teacherProfile } = useOnboarding();
  
  // Use subjects from profile if available, otherwise show all
  const learningAreas = teacherProfile.subjects && teacherProfile.subjects.length > 0
    ? teacherProfile.subjects
    : allLearningAreas;
  const toggleDay = (day: string) => {
    const currentDays = formData.lessonDays || [];
    if (currentDays.includes(day)) {
      onChange('lessonDays', currentDays.filter(d => d !== day));
    } else {
      onChange('lessonDays', [...currentDays, day]);
    }
  };

  const canProceed = formData.learningArea && (formData.lessonDays?.length || 0) > 0 && formData.lessonDuration > 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Lesson Details</CardTitle>
        <CardDescription>
          Configure the specifics of your lesson
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label className="text-base">Learning Area / Subject</Label>
          <Select value={formData.learningArea} onValueChange={(v) => onChange('learningArea', v)}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {learningAreas.map(area => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Week
          </Label>
          <Input
            type="number"
            value={formData.lessonWeek}
            onChange={(e) => onChange('lessonWeek', parseInt(e.target.value) || 1)}
            min={1}
            max={15}
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Lesson Days
          </Label>
          <p className="text-sm text-muted-foreground">Select one or more days for this lesson plan</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {days.map(day => {
              const isSelected = (formData.lessonDays || []).includes(day);
              return (
                <div
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`
                    flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-primary bg-primary/10 text-primary font-medium' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <Checkbox 
                    checked={isSelected} 
                    className="sr-only"
                  />
                  <span className="text-sm">{day}</span>
                </div>
              );
            })}
          </div>
          {(formData.lessonDays?.length || 0) > 0 && (
            <p className="text-sm text-primary font-medium">
              {formData.lessonDays?.length} day{formData.lessonDays?.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Lesson Duration (minutes per day)
          </Label>
          <div className="flex gap-2">
            {[30, 45, 60, 90].map((duration) => (
              <Button
                key={duration}
                type="button"
                variant={formData.lessonDuration === duration ? 'default' : 'outline'}
                className="flex-1 h-12"
                onClick={() => onChange('lessonDuration', duration)}
              >
                {duration} min
              </Button>
            ))}
          </div>
          <Input
            type="number"
            value={formData.lessonDuration}
            onChange={(e) => onChange('lessonDuration', parseInt(e.target.value) || 30)}
            min={15}
            max={180}
            step={5}
            className="h-12 text-base mt-2"
            placeholder="Or enter custom duration"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            onClick={onBack}
            variant="outline"
            className="flex-1 h-12 text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={onNext} 
            disabled={!canProceed}
            className="flex-1 h-12 text-base"
            variant="hero"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonDetailsStep;
