import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Settings2 } from 'lucide-react';
import { QuizTestFormData, QuestionFormat, DOKLevel } from '@/types/quiz';

interface Props {
  formData: QuizTestFormData;
  onChange: (field: keyof QuizTestFormData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const questionFormatOptions: { value: QuestionFormat; label: string; description: string }[] = [
  { value: 'mcq', label: 'Multiple Choice', description: 'A, B, C, D options' },
  { value: 'true_false', label: 'True / False', description: 'Two-option questions' },
  { value: 'short_answer', label: 'Short Answer', description: 'Brief written responses' },
  { value: 'fill_blank', label: 'Fill in the Blank', description: 'Complete the sentence' },
];

const dokLevels: { value: DOKLevel; label: string; description: string }[] = [
  { value: 1, label: 'DOK 1 — Recall', description: 'Facts, definitions, simple procedures' },
  { value: 2, label: 'DOK 2 — Skill/Concept', description: 'Comparisons, classifications, cause & effect' },
  { value: 3, label: 'DOK 3 — Strategic Thinking', description: 'Reasoning, justifying, drawing conclusions' },
  { value: 4, label: 'DOK 4 — Extended Thinking', description: 'Research, synthesis, complex analysis' },
];

const QuizConfigureStep: React.FC<Props> = ({ formData, onChange, onNext, onBack }) => {
  const toggleFormat = (fmt: QuestionFormat) => {
    const current = formData.questionFormats;
    const updated = current.includes(fmt)
      ? current.filter(f => f !== fmt)
      : [...current, fmt];
    if (updated.length > 0) onChange('questionFormats', updated);
  };

  const label = formData.type === 'quiz' ? 'Quiz' : 'Test';
  const minQ = formData.type === 'quiz' ? 5 : 20;
  const maxQ = formData.type === 'quiz' ? 20 : 40;
  const isValid = formData.questionFormats.length > 0 && formData.questionCount >= minQ && formData.questionCount <= maxQ && formData.duration > 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Settings2 className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Configure {label}</CardTitle>
        <CardDescription>Set the question format, difficulty, and length</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Question Formats */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Question Formats</Label>
          <p className="text-xs text-muted-foreground">Select one or more formats</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {questionFormatOptions.map(opt => (
              <label key={opt.value} className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                <Checkbox
                  checked={formData.questionFormats.includes(opt.value)}
                  onCheckedChange={() => toggleFormat(opt.value)}
                  className="mt-0.5"
                />
                <div>
                  <span className="text-sm font-medium">{opt.label}</span>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* DOK Level */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">Depth of Knowledge (DOK)</Label>
          <Select value={String(formData.dokLevel)} onValueChange={(v) => onChange('dokLevel', Number(v) as DOKLevel)}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              {dokLevels.map(d => (
                <SelectItem key={d.value} value={String(d.value)}>
                  {d.label} — {d.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Number of Questions & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base">Number of Questions</Label>
            <Input type="number" min={minQ} max={maxQ} value={formData.questionCount}
              onChange={(e) => onChange('questionCount', parseInt(e.target.value) || 0)} className="h-11" />
            <p className="text-xs text-muted-foreground">{minQ}–{maxQ} questions</p>
          </div>
          <div className="space-y-2">
            <Label className="text-base">Duration (minutes)</Label>
            <Input type="number" min={5} max={120} value={formData.duration}
              onChange={(e) => onChange('duration', parseInt(e.target.value) || 0)} className="h-11" />
            <p className="text-xs text-muted-foreground">Time allowed</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={onBack} variant="outline" className="flex-1 h-12 text-base">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={onNext} disabled={!isValid} className="flex-1 h-12 text-base" variant="hero">
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizConfigureStep;
