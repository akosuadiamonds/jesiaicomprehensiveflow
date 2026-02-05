import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileQuestion, Plus, ClipboardList, GraduationCap, Clock, BookOpen, Settings2, Sparkles, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const TestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');

  // Mock data for recent tests
  const recentTests = [
    { id: 1, title: 'Mathematics - Fractions Quiz', type: 'quiz', questions: 15, class: 'Class 4', date: '2025-02-03', status: 'completed' },
    { id: 2, title: 'English - Grammar Test', type: 'test', questions: 25, class: 'Class 5', date: '2025-02-01', status: 'draft' },
    { id: 3, title: 'Science - Term 1 Exam', type: 'exam', questions: 50, class: 'Class 6', date: '2025-01-28', status: 'completed' },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Test & Exam Generator
        </h1>
        <p className="text-muted-foreground">
          Create AI-powered quizzes, tests, and end-of-term exams for your students
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            My Tests
          </TabsTrigger>
        </TabsList>

        {/* Create New Tab */}
        <TabsContent value="create" className="space-y-6">
          {/* Test Type Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Quick Quiz Card */}
            <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                    <FileQuestion className="w-6 h-6 text-accent" />
                  </div>
                  <Badge variant="secondary" className="text-xs">5-20 questions</Badge>
                </div>
                <CardTitle className="text-lg">Quick Quiz</CardTitle>
                <CardDescription>
                  Generate short quizzes for class activities, homework, or quick assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> 10-15 mins
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" /> Multiple choice
                  </span>
                </div>
                <Button className="w-full" variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Quiz
                </Button>
              </CardContent>
            </Card>

            {/* Class Test Card */}
            <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">20-40 questions</Badge>
                </div>
                <CardTitle className="text-lg">Class Test</CardTitle>
                <CardDescription>
                  Create comprehensive tests covering specific topics or units
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> 30-45 mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Settings2 className="w-4 h-4" /> Mixed formats
                  </span>
                </div>
                <Button className="w-full" variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Test
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* End of Term Exam Card - Full Width */}
          <Card className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group border-2 border-dashed">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                    <GraduationCap className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">End of Term Examination</CardTitle>
                    <CardDescription className="mt-1">
                      Generate comprehensive end-of-term exams with full curriculum coverage
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">50-100 questions</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> 1-2 hours
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> All question types
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Full term coverage
                </span>
                <span className="flex items-center gap-1">
                  <Settings2 className="w-4 h-4" /> Marking scheme included
                </span>
              </div>
              <Button className="w-full md:w-auto">
                <Sparkles className="w-4 h-4 mr-2" />
                Create End of Term Exam
              </Button>
            </CardContent>
          </Card>

          {/* Features Overview */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base">What's Included</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">AI-Generated</p>
                    <p className="text-xs text-muted-foreground">Questions aligned to curriculum</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Multiple Formats</p>
                    <p className="text-xs text-muted-foreground">MCQ, True/False, Short answer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Marking Scheme</p>
                    <p className="text-xs text-muted-foreground">Answer keys & rubrics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">PDF Export</p>
                    <p className="text-xs text-muted-foreground">Print-ready documents</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {recentTests.length > 0 ? (
            <div className="space-y-3">
              {recentTests.map((test) => (
                <Card key={test.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        test.type === 'exam' ? 'bg-primary/10' : 
                        test.type === 'test' ? 'bg-accent/10' : 'bg-muted'
                      }`}>
                        {test.type === 'exam' ? (
                          <GraduationCap className={`w-5 h-5 text-primary`} />
                        ) : test.type === 'test' ? (
                          <FileText className="w-5 h-5 text-accent" />
                        ) : (
                          <FileQuestion className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{test.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {test.class} • {test.questions} questions • {test.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={test.status === 'completed' ? 'default' : 'secondary'}>
                        {test.status}
                      </Badge>
                      <Button variant="ghost" size="sm">View</Button>
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
                <p className="text-muted-foreground text-center">
                  No tests created yet. Start by creating your first quiz or exam.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestPage;
