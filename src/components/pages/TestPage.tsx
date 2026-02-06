import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GraduationCap, Clock, BookOpen, Settings2, Sparkles, Calendar, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ExamWizard from '@/components/exam/ExamWizard';

const TestPage: React.FC = () => {
  const [showExamWizard, setShowExamWizard] = useState(false);

  if (showExamWizard) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <ExamWizard onCancel={() => setShowExamWizard(false)} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Test & Exam Generator
        </h1>
        <p className="text-muted-foreground">
          Create AI-powered quizzes, tests, and end-of-term exams for your students
        </p>
      </div>

      {/* End of Term Exam Card */}
      <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group border-2 border-dashed"
        onClick={() => setShowExamWizard(true)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                <GraduationCap className="w-7 h-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">End of Term Examination</CardTitle>
                <CardDescription className="mt-1">
                  Generate comprehensive end-of-term exams with full curriculum coverage and marking scheme
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">AI Powered</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 1-2 hours</span>
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> MCQ + Theory</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Full term coverage</span>
            <span className="flex items-center gap-1"><Settings2 className="w-4 h-4" /> Marking scheme included</span>
          </div>
          <Button className="w-full md:w-auto">
            <Sparkles className="w-4 h-4 mr-2" /> Create End of Term Exam
          </Button>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card className="bg-muted/30 mt-6">
        <CardHeader><CardTitle className="text-base">What's Included</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">AI-Generated</p>
                <p className="text-xs text-muted-foreground">Questions aligned to GES curriculum</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="font-medium text-sm">MCQ + Theory</p>
                <p className="text-xs text-muted-foreground">Section A objectives & Section B theory</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Marking Scheme</p>
                <p className="text-xs text-muted-foreground">Complete answer keys & expected answers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="font-medium text-sm">PDF Export</p>
                <p className="text-xs text-muted-foreground">Print-ready exam papers</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;
