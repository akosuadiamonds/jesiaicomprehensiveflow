import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lock, Sparkles, Loader2, Users } from 'lucide-react';
import { QuizTestFormData } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  formData: QuizTestFormData;
  onChange: (field: keyof QuizTestFormData, value: any) => void;
  onGenerate: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

const QuizSettingsStep: React.FC<Props> = ({ formData, onChange, onGenerate, onBack, isGenerating }) => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<{ id: string; name: string; subject: string }[]>([]);
  const label = formData.type === 'quiz' ? 'Quiz' : 'Test';

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!user) return;
      const { data } = await supabase.from('classrooms').select('id, name, subject').eq('teacher_id', user.id);
      if (data) setClassrooms(data);
    };
    fetchClassrooms();
  }, [user]);

  const handleLockToggle = (checked: boolean) => {
    onChange('isLocked', checked);
    if (checked && !formData.accessCode) {
      onChange('accessCode', Math.random().toString(36).substring(2, 8).toUpperCase());
    }
  };

  const formatLabels: Record<string, string> = {
    mcq: 'MCQ', true_false: 'True/False', short_answer: 'Short Answer', fill_blank: 'Fill in Blank'
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">{label} Settings</CardTitle>
        <CardDescription>Configure access control and assign to a class</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Lock Quiz */}
        <div className="flex items-center justify-between p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">Lock {label}</p>
              <p className="text-xs text-muted-foreground">Students need an access code to start</p>
            </div>
          </div>
          <Switch checked={formData.isLocked} onCheckedChange={handleLockToggle} />
        </div>

        {formData.isLocked && (
          <div className="space-y-2">
            <Label className="text-base">Access Code</Label>
            <Input value={formData.accessCode} onChange={(e) => onChange('accessCode', e.target.value.toUpperCase())}
              className="h-11 font-mono text-lg tracking-widest" maxLength={8} placeholder="e.g., ABC123" />
            <p className="text-xs text-muted-foreground">Share this code with students before they can access the {label.toLowerCase()}</p>
          </div>
        )}

        {/* Assign to Classroom */}
        <div className="space-y-2">
          <Label className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Assign to Classroom (Optional)</Label>
          <Select value={formData.assignedClassroomId} onValueChange={(v) => onChange('assignedClassroomId', v)}>
            <SelectTrigger className="h-11"><SelectValue placeholder="Select a classroom" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No classroom</SelectItem>
              {classrooms.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name} ({c.subject})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-1">
          <p className="text-sm font-medium text-foreground">Summary</p>
          <p className="text-sm text-muted-foreground">
            <strong>{formData.title}</strong> • {formData.class} ({formData.subject})
          </p>
          <p className="text-sm text-muted-foreground">
            {formData.questionCount} questions • {formData.duration} min • DOK {formData.dokLevel}
          </p>
          <p className="text-sm text-muted-foreground">
            Formats: {formData.questionFormats.map(f => formatLabels[f]).join(', ')}
          </p>
          {formData.isLocked && (
            <p className="text-sm text-muted-foreground">🔒 Locked — Code: <span className="font-mono font-bold">{formData.accessCode}</span></p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={onBack} variant="outline" className="flex-1 h-12 text-base">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={onGenerate} disabled={isGenerating} className="flex-1 h-12 text-base" variant="hero">
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate {label}</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSettingsStep;
