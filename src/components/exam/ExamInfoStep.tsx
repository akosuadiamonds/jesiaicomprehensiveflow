import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { ExamFormData } from '@/types/exam';

interface ExamInfoStepProps {
  formData: ExamFormData;
  onChange: (field: keyof ExamFormData, value: any) => void;
  onNext: () => void;
  onCancel: () => void;
}

const levels = ['Primary', 'JHS', 'SHS'];
const classesByLevel: Record<string, string[]> = {
  Primary: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
  JHS: ['JHS 1', 'JHS 2', 'JHS 3'],
  SHS: ['SHS 1', 'SHS 2', 'SHS 3'],
};

const subjects = [
  'English Language', 'Mathematics', 'Science', 'Social Studies',
  'Creative Arts', 'Physical Education', 'ICT', 'French',
  'Ghanaian Language', 'Religious & Moral Education',
];

const ExamInfoStep: React.FC<ExamInfoStepProps> = ({ formData, onChange, onNext, onCancel }) => {
  const classOptions = formData.level ? classesByLevel[formData.level] || [] : [];
  const isValid = formData.level && formData.class && formData.subject;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Exam Information</CardTitle>
        <CardDescription>Select the level, class and subject for the exam</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div className="space-y-2">
          <Label className="text-base">Level</Label>
          <Select value={formData.level} onValueChange={(v) => { onChange('level', v); onChange('class', ''); }}>
            <SelectTrigger className="h-11"><SelectValue placeholder="Select level" /></SelectTrigger>
            <SelectContent>
              {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base">Class</Label>
          <Select value={formData.class} onValueChange={(v) => onChange('class', v)} disabled={!formData.level}>
            <SelectTrigger className="h-11"><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {classOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base">Subject</Label>
          <Select value={formData.subject} onValueChange={(v) => onChange('subject', v)}>
            <SelectTrigger className="h-11"><SelectValue placeholder="Select subject" /></SelectTrigger>
            <SelectContent>
              {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={onCancel} variant="outline" className="flex-1 h-12 text-base">Cancel</Button>
          <Button onClick={onNext} disabled={!isValid} className="flex-1 h-12 text-base" variant="hero">
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamInfoStep;
