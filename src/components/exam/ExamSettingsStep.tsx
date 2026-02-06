import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings2, Sparkles, Loader2 } from 'lucide-react';
import { ExamFormData } from '@/types/exam';

interface ExamSettingsStepProps {
  formData: ExamFormData;
  onChange: (field: keyof ExamFormData, value: any) => void;
  onGenerate: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

const ExamSettingsStep: React.FC<ExamSettingsStepProps> = ({ formData, onChange, onGenerate, onBack, isGenerating }) => {
  const isValid = formData.schoolName.trim() && formData.examName.trim() && formData.objectiveCount > 0 && formData.sectionBCount > 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Settings2 className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Exam Settings</CardTitle>
        <CardDescription>Configure the exam details and question counts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div className="space-y-2">
          <Label className="text-base">School Name</Label>
          <Input
            placeholder="e.g., Accra Academy"
            value={formData.schoolName}
            onChange={(e) => onChange('schoolName', e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base">Exam Name</Label>
          <Input
            placeholder="e.g., End of Term 1 Examination"
            value={formData.examName}
            onChange={(e) => onChange('examName', e.target.value)}
            className="h-11"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base">Section A (Objectives/MCQ)</Label>
            <Input
              type="number"
              min={5}
              max={60}
              value={formData.objectiveCount}
              onChange={(e) => onChange('objectiveCount', parseInt(e.target.value) || 0)}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">Number of multiple choice questions</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base">Section B (Theory)</Label>
            <Input
              type="number"
              min={2}
              max={20}
              value={formData.sectionBCount}
              onChange={(e) => onChange('sectionBCount', parseInt(e.target.value) || 0)}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">Number of theory questions</p>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Summary:</strong> {formData.examName || 'Exam'} for {formData.class} ({formData.subject}) — {formData.objectiveCount} MCQs + {formData.sectionBCount} theory questions
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={onBack} variant="outline" className="flex-1 h-12 text-base">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={onGenerate} disabled={!isValid || isGenerating} className="flex-1 h-12 text-base" variant="hero">
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate Exam</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamSettingsStep;
