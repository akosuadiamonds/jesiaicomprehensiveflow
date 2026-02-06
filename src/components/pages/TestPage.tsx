import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileQuestion, Plus, ClipboardList, GraduationCap, Clock, BookOpen, Settings2, Sparkles, FileText, Calendar, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ExamWizard from '@/components/exam/ExamWizard';
import QuizTestWizard from '@/components/quiz/QuizTestWizard';
import { QuizTestType } from '@/types/quiz';
import { useSavedQuizzes } from '@/hooks/useSavedQuizzes';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [showExamWizard, setShowExamWizard] = useState(false);
  const [showQuizWizard, setShowQuizWizard] = useState<QuizTestType | null>(null);
  const { quizzes, loading, refetch, deleteQuiz } = useSavedQuizzes();

  const handleDelete = async (id: string) => {
    await deleteQuiz(id);
    toast.success('Deleted successfully');
  };

  if (showQuizWizard) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <QuizTestWizard
          type={showQuizWizard}
          onCancel={() => { setShowQuizWizard(null); refetch(); }}
          onSaved={refetch}
        />
      </div>
    );
  }

  if (showExamWizard) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <ExamWizard onCancel={() => setShowExamWizard(false)} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Test & Exam Generator</h1>
        <p className="text-muted-foreground">Create AI-powered quizzes, tests, and end-of-term exams for your students</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2"><Plus className="w-4 h-4" /> Create New</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> My Tests
            {quizzes.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">{quizzes.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Create New Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Quick Quiz Card */}
            <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group" onClick={() => setShowQuizWizard('quiz')}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                    <FileQuestion className="w-6 h-6 text-accent" />
                  </div>
                  <Badge variant="secondary" className="text-xs">5-20 questions</Badge>
                </div>
                <CardTitle className="text-lg">Quick Quiz</CardTitle>
                <CardDescription>Generate short quizzes for class activities, homework, or quick assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 10-15 mins</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> Multiple choice</span>
                </div>
                <Button className="w-full" variant="outline"><Sparkles className="w-4 h-4 mr-2" /> Create Quiz</Button>
              </CardContent>
            </Card>

            {/* Class Test Card */}
            <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group" onClick={() => setShowQuizWizard('test')}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">20-40 questions</Badge>
                </div>
                <CardTitle className="text-lg">Class Test</CardTitle>
                <CardDescription>Create comprehensive tests covering specific topics or units</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 30-45 mins</span>
                  <span className="flex items-center gap-1"><Settings2 className="w-4 h-4" /> Mixed formats</span>
                </div>
                <Button className="w-full" variant="outline"><Sparkles className="w-4 h-4 mr-2" /> Create Test</Button>
              </CardContent>
            </Card>
          </div>

          {/* End of Term Exam */}
          <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group border-2 border-dashed" onClick={() => setShowExamWizard(true)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                    <GraduationCap className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">End of Term Examination</CardTitle>
                    <CardDescription className="mt-1">Generate comprehensive end-of-term exams with full curriculum coverage</CardDescription>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">50-100 questions</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 1-2 hours</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> All question types</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Full term coverage</span>
                <span className="flex items-center gap-1"><Settings2 className="w-4 h-4" /> Marking scheme included</span>
              </div>
              <Button className="w-full md:w-auto"><Sparkles className="w-4 h-4 mr-2" /> Create End of Term Exam</Button>
            </CardContent>
          </Card>

          {/* Features Overview */}
          <Card className="bg-muted/30">
            <CardHeader><CardTitle className="text-base">What's Included</CardTitle></CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Sparkles, label: 'AI-Generated', desc: 'Questions aligned to curriculum', color: 'primary' },
                  { icon: FileText, label: 'Multiple Formats', desc: 'MCQ, True/False, Short answer', color: 'accent' },
                  { icon: ClipboardList, label: 'Marking Scheme', desc: 'Answer keys & rubrics', color: 'primary' },
                  { icon: BookOpen, label: 'PDF Export', desc: 'Print-ready documents', color: 'accent' },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${f.color}/10 flex items-center justify-center flex-shrink-0`}>
                      <f.icon className={`w-4 h-4 text-${f.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : quizzes.length > 0 ? (
            <div className="space-y-3">
              {quizzes.map((item) => (
                <Card key={item.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.type === 'test' ? 'bg-primary/10' : 'bg-accent/10'
                      }`}>
                        {item.type === 'test' ? (
                          <FileText className="w-5 h-5 text-primary" />
                        ) : (
                          <FileQuestion className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.class} • {item.subject} • {item.questions.length} questions • {format(item.createdAt, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={item.status === 'assigned' ? 'default' : item.status === 'approved' ? 'default' : 'secondary'}>
                        {item.status === 'assigned' ? '✅ Assigned' : item.status === 'approved' ? '✓ Approved' : '📝 Draft'}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <ClipboardList className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">No tests created yet. Start by creating your first quiz or exam.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestPage;
