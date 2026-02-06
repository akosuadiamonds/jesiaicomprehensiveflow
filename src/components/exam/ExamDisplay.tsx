import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Loader2, RefreshCw, ArrowLeft, BookOpen, ClipboardList, Save, CheckCircle } from 'lucide-react';
import { GeneratedExam } from '@/types/exam';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';

interface ExamDisplayProps {
  exam: GeneratedExam;
  onRegenerate: () => void;
  onBack: () => void;
  isRegenerating: boolean;
}

const ExamDisplay: React.FC<ExamDisplayProps> = ({ exam, onRegenerate, onBack, isRegenerating }) => {
  const [activeTab, setActiveTab] = useState<'exam' | 'marking'>('exam');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('saved_exams' as any).insert({
        teacher_id: user.id,
        school_name: exam.schoolName,
        exam_name: exam.examName,
        subject: exam.subject,
        class: exam.class,
        level: exam.level,
        duration: exam.duration,
        total_marks: exam.totalMarks,
        section_a: JSON.parse(JSON.stringify(exam.sectionA)),
        section_b: JSON.parse(JSON.stringify(exam.sectionB)),
        status: 'draft',
      } as any);

      if (error) throw error;
      setIsSaved(true);
      toast({ title: 'Exam saved successfully!' });
    } catch (error: any) {
      console.error('Error saving exam:', error);
      toast({ title: 'Failed to save exam', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);
    try {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${exam.examName}-${activeTab === 'exam' ? 'questions' : 'marking-scheme'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      await html2pdf().set(opt).from(contentRef.current).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> New Exam
        </Button>
        <Button variant="outline" onClick={onRegenerate} disabled={isRegenerating}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} /> Regenerate
        </Button>
        <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Download PDF
        </Button>
        <Button onClick={handleSave} disabled={isSaving || isSaved} variant={isSaved ? 'secondary' : 'default'}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : isSaved ? <CheckCircle className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {isSaved ? 'Saved' : 'Save Exam'}
        </Button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button onClick={() => setActiveTab('exam')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'exam' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <BookOpen className="w-4 h-4 inline mr-2" /> Exam Paper
        </button>
        <button onClick={() => setActiveTab('marking')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'marking' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <ClipboardList className="w-4 h-4 inline mr-2" /> Marking Scheme
        </button>
      </div>

      <div ref={contentRef}>
        {activeTab === 'exam' ? (
          <div className="space-y-6">
            {/* Exam Header */}
            <Card>
              <CardContent className="pt-6 text-center space-y-1">
                <h2 className="text-lg font-bold uppercase">{exam.schoolName}</h2>
                <h3 className="text-base font-semibold">{exam.examName}</h3>
                <p className="text-sm text-muted-foreground">{exam.subject} — {exam.class}</p>
                <p className="text-sm text-muted-foreground">Duration: {exam.duration} | Total Marks: {exam.totalMarks}</p>
              </CardContent>
            </Card>

            {/* Section A */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Section A: Objectives (Multiple Choice)</CardTitle>
                <p className="text-sm text-muted-foreground">Choose the correct answer for each question.</p>
              </CardHeader>
              <CardContent className="space-y-5">
                {exam.sectionA.map((q) => (
                  <div key={q.number} className="space-y-2">
                    <p className="text-sm font-medium">{q.number}. {q.question}</p>
                    <div className="grid grid-cols-2 gap-1 pl-4">
                      {q.options.map((opt) => (
                        <p key={opt.label} className="text-sm text-muted-foreground">{opt.label}. {opt.text}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Section B */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Section B: Theory</CardTitle>
                <p className="text-sm text-muted-foreground">Answer all questions in the spaces provided.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {exam.sectionB.map((q) => (
                  <div key={q.number} className="space-y-1">
                    <p className="text-sm font-medium">{q.number}. {q.question} <span className="text-muted-foreground">({q.marks} marks)</span></p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Marking Scheme */
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center space-y-1">
                <h2 className="text-lg font-bold uppercase">{exam.schoolName}</h2>
                <h3 className="text-base font-semibold">{exam.examName} — Marking Scheme</h3>
                <p className="text-sm text-muted-foreground">{exam.subject} — {exam.class}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Section A: Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {exam.sectionA.map((q) => (
                    <div key={q.number} className="text-center p-2 bg-muted/50 rounded-md">
                      <p className="text-xs text-muted-foreground">{q.number}</p>
                      <p className="font-bold text-primary">{q.correctAnswer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Section B: Expected Answers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {exam.sectionB.map((q) => (
                  <div key={q.number} className="space-y-1 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">{q.number}. {q.question} <span className="text-muted-foreground">({q.marks} marks)</span></p>
                    <Separator className="my-2" />
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{q.expectedAnswer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDisplay;
