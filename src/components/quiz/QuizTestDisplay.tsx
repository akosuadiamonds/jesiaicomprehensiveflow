import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, Loader2, RefreshCw, ArrowLeft, BookOpen, ClipboardList, CheckCircle, Edit3, Save, X, Lock, Users, Copy } from 'lucide-react';
import { GeneratedQuizTest, QuizMCQQuestion } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

interface Props {
  quiz: GeneratedQuizTest;
  onRegenerate: () => void;
  onBack: () => void;
  isRegenerating: boolean;
  onUpdateQuiz: (quiz: GeneratedQuizTest) => void;
}

const formatLabels: Record<string, string> = {
  mcq: 'Multiple Choice', true_false: 'True/False', short_answer: 'Short Answer', fill_blank: 'Fill in Blank'
};

const QuizTestDisplay: React.FC<Props> = ({ quiz, onRegenerate, onBack, isRegenerating, onUpdateQuiz }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState<QuizMCQQuestion[]>(quiz.questions);
  const [isDownloading, setIsDownloading] = useState(false);
  const [classrooms, setClassrooms] = useState<{ id: string; name: string; subject: string }[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const label = quiz.type === 'quiz' ? 'Quiz' : 'Test';

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!user) return;
      const { data } = await supabase.from('classrooms').select('id, name, subject').eq('teacher_id', user.id);
      if (data) setClassrooms(data);
    };
    fetchClassrooms();
  }, [user]);

  const handleSaveEdits = () => {
    onUpdateQuiz({ ...quiz, questions: editedQuestions });
    setIsEditing(false);
    toast.success('Changes saved!');
  };

  const handleApprove = () => {
    onUpdateQuiz({ ...quiz, status: 'approved' });
    toast.success(`${label} approved! You can now assign it to a class.`);
  };

  const handleAssignToClass = (classroomId: string) => {
    if (classroomId === 'none') {
      onUpdateQuiz({ ...quiz, assignedClassroomId: '', status: 'approved' });
      toast.info('Classroom assignment removed.');
    } else {
      onUpdateQuiz({ ...quiz, assignedClassroomId: classroomId, status: 'assigned' });
      const classroom = classrooms.find(c => c.id === classroomId);
      toast.success(`${label} assigned to ${classroom?.name || 'classroom'}!`);
    }
  };

  const handleCopyCode = () => {
    if (quiz.accessCode) {
      navigator.clipboard.writeText(quiz.accessCode);
      toast.success('Access code copied!');
    }
  };

  const handleDownload = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);
    try {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${quiz.title}-${activeTab}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };
      await html2pdf().set(opt).from(contentRef.current).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const updateQuestion = (index: number, field: keyof QuizMCQQuestion, value: any) => {
    setEditedQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIndex: number, oIndex: number, text: string) => {
    setEditedQuestions(prev => prev.map((q, qi) => {
      if (qi !== qIndex || !q.options) return q;
      const newOpts = q.options.map((o, oi) => oi === oIndex ? { ...o, text } : o);
      return { ...q, options: newOpts };
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        <Button variant="outline" onClick={onRegenerate} disabled={isRegenerating}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} /> Regenerate
        </Button>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}><Edit3 className="w-4 h-4 mr-2" /> Edit</Button>
        ) : (
          <>
            <Button variant="outline" onClick={handleSaveEdits}><Save className="w-4 h-4 mr-2" /> Save</Button>
            <Button variant="ghost" onClick={() => { setEditedQuestions(quiz.questions); setIsEditing(false); }}><X className="w-4 h-4 mr-2" /> Cancel</Button>
          </>
        )}
        <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Download PDF
        </Button>
      </div>

      {/* Status & Info Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <Badge variant={quiz.status === 'approved' ? 'default' : quiz.status === 'assigned' ? 'default' : 'secondary'}>
          {quiz.status === 'assigned' ? '✅ Assigned' : quiz.status === 'approved' ? '✓ Approved' : '📝 Draft'}
        </Badge>
        <Badge variant="outline">{quiz.questionFormats.map(f => formatLabels[f]).join(', ')}</Badge>
        <Badge variant="outline">DOK {quiz.dokLevel}</Badge>
        <Badge variant="outline">{quiz.duration} min</Badge>
        {quiz.isLocked && (
          <Badge variant="outline" className="flex items-center gap-1 cursor-pointer" onClick={handleCopyCode}>
            <Lock className="w-3 h-3" /> Code: {quiz.accessCode} <Copy className="w-3 h-3" />
          </Badge>
        )}
      </div>

      {/* Approval & Assignment Section */}
      <Card className="border-2 border-dashed">
        <CardContent className="py-4 space-y-4">
          {quiz.status === 'draft' && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Review & Approve</p>
                <p className="text-xs text-muted-foreground">Review the questions below, edit if needed, then approve to assign to a class</p>
              </div>
              <Button onClick={handleApprove} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <CheckCircle className="w-4 h-4 mr-2" /> Approve {label}
              </Button>
            </div>
          )}

          {(quiz.status === 'approved' || quiz.status === 'assigned') && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium flex items-center gap-2 mb-1.5">
                  <Users className="w-4 h-4" /> Assign to Classroom
                </Label>
                <Select value={quiz.assignedClassroomId || 'none'} onValueChange={handleAssignToClass}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select a classroom" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No classroom</SelectItem>
                    {classrooms.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({c.subject})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {quiz.status === 'assigned' && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mt-2 sm:mt-6">
                  Assigned to {classrooms.find(c => c.id === quiz.assignedClassroomId)?.name || 'classroom'}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'questions' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <BookOpen className="w-4 h-4 inline mr-2" /> Questions
        </button>
        <button onClick={() => setActiveTab('answers')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'answers' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          <ClipboardList className="w-4 h-4 inline mr-2" /> Answer Key
        </button>
      </div>

      <div ref={contentRef}>
        {activeTab === 'questions' ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center space-y-1">
                <h2 className="text-lg font-bold">{quiz.title}</h2>
                <p className="text-sm text-muted-foreground">{quiz.subject} — {quiz.class} | Duration: {quiz.duration} minutes | Total Marks: {quiz.totalMarks}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {(isEditing ? editedQuestions : quiz.questions).map((q, qi) => (
                  <div key={q.number} className="space-y-2">
                    {isEditing ? (
                      <Textarea value={q.question} onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                        className="text-sm font-medium" />
                    ) : (
                      <p className="text-sm font-medium">{q.number}. {q.question}</p>
                    )}

                    {q.format === 'mcq' && q.options && (
                      <div className="grid grid-cols-2 gap-1 pl-4">
                        {q.options.map((opt, oi) => (
                          isEditing ? (
                            <div key={opt.label} className="flex items-center gap-1">
                              <span className="text-sm text-muted-foreground">{opt.label}.</span>
                              <Input value={opt.text} onChange={(e) => updateOption(qi, oi, e.target.value)} className="h-8 text-sm" />
                            </div>
                          ) : (
                            <p key={opt.label} className="text-sm text-muted-foreground">{opt.label}. {opt.text}</p>
                          )
                        ))}
                      </div>
                    )}

                    {q.format === 'true_false' && !isEditing && (
                      <div className="flex gap-4 pl-4">
                        <p className="text-sm text-muted-foreground">A. True</p>
                        <p className="text-sm text-muted-foreground">B. False</p>
                      </div>
                    )}

                    {(q.format === 'short_answer' || q.format === 'fill_blank') && !isEditing && (
                      <div className="pl-4">
                        <div className="border-b border-dashed border-muted-foreground w-48 mt-1" />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center space-y-1">
                <h2 className="text-lg font-bold">{quiz.title} — Answer Key</h2>
                <p className="text-sm text-muted-foreground">{quiz.subject} — {quiz.class}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Answers</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {quiz.questions.map((q) => (
                  <div key={q.number} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-bold text-primary min-w-[2rem]">{q.number}.</span>
                    <div>
                      <p className="text-sm text-muted-foreground truncate max-w-md">{q.question}</p>
                      <p className="text-sm font-semibold mt-1">Answer: {q.correctAnswer}</p>
                    </div>
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

export default QuizTestDisplay;
