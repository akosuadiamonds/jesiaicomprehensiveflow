import React from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Users, GraduationCap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { LessonPlanFormData } from '@/types/lesson';

const classes = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];

interface ClassInfoStepProps {
  formData: LessonPlanFormData;
  onChange: (field: keyof LessonPlanFormData, value: any) => void;
  onNext: () => void;
}

const ClassInfoStep: React.FC<ClassInfoStepProps> = ({ formData, onChange, onNext }) => {
  const { currentTerm, setCurrentTerm } = useApp();

  const canProceed = formData.class && formData.classSize > 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Class Information</CardTitle>
        <CardDescription>
          Tell us about your class to personalize the lesson plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="class" className="text-base">Which class are you teaching?</Label>
          <Select value={formData.class} onValueChange={(v) => onChange('class', v)}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Select your class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="classSize" className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            How many students are in your class?
          </Label>
          <Input
            id="classSize"
            type="number"
            value={formData.classSize}
            onChange={(e) => onChange('classSize', parseInt(e.target.value) || 0)}
            min={1}
            max={100}
            className="h-12 text-base"
            placeholder="Enter number of students"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base">Current Term</Label>
          <Select value={currentTerm} onValueChange={setCurrentTerm}>
            <SelectTrigger className="h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Term 1">Term 1</SelectItem>
              <SelectItem value="Term 2">Term 2</SelectItem>
              <SelectItem value="Term 3">Term 3</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            This setting persists across all your lesson plans
          </p>
        </div>

        <Button 
          onClick={onNext} 
          disabled={!canProceed}
          className="w-full h-12 text-base mt-4"
          variant="hero"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClassInfoStep;
