import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  Brain, ArrowUp, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudent } from '@/contexts/StudentContext';
import { toast } from 'sonner';

const weeklyActivity = [
  { day: 'Mon', questions: 25, time: 45 },
  { day: 'Tue', questions: 30, time: 50 },
  { day: 'Wed', questions: 40, time: 75 },
  { day: 'Thu', questions: 15, time: 30 },
  { day: 'Fri', questions: 35, time: 60 },
  { day: 'Sat', questions: 10, time: 15 },
  { day: 'Sun', questions: 20, time: 40 },
];

const progressTrend = [
  { week: 'Week 1', score: 60 },
  { week: 'Week 2', score: 65 },
  { week: 'Week 3', score: 68 },
  { week: 'Week 4', score: 72 },
  { week: 'Week 5', score: 70 },
  { week: 'Week 6', score: 75 },
];

const subjectBreakdown = [
  { 
    name: 'Mathematics', emoji: '🟢', understanding: 'Good', accuracy: 75,
    strongTopics: ['Fractions', 'Linear equations'], weakTopics: ['Word problems'],
    color: '#22C55E'
  },
  { 
    name: 'English Language', emoji: '🟡', understanding: 'Fair', accuracy: 62,
    strongTopics: ['Grammar', 'Vocabulary'], weakTopics: ['Comprehension'],
    color: '#EAB308'
  },
  { 
    name: 'Integrated Science', emoji: '🔵', understanding: 'Very Good', accuracy: 80,
    strongTopics: ['Photosynthesis', 'The human body'], weakTopics: [],
    color: '#3B82F6'
  },
  { 
    name: 'Social Studies', emoji: '🟢', understanding: 'Good', accuracy: 78,
    strongTopics: ['Ghana history', 'Government'], weakTopics: ['Map reading'],
    color: '#22C55E'
  },
];

const mockExamScores = [
  { subject: 'Mathematics', score: 68, total: 100 },
  { subject: 'English', score: 55, total: 100 },
  { subject: 'Science', score: 78, total: 100 },
  { subject: 'Social Studies', score: 72, total: 100 },
];

// AI recommendation based on weakest areas
const aiRecommendation = {
  message: "Practice 10 comprehension questions today.",
  subject: "English Language",
  topic: "Comprehension",
};

const StudentInsightZone: React.FC = () => {
  const { profile } = useAuth();
  const { navigateToPractice } = useStudent();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const studentName = profile?.first_name || 'Student';
  const classGrade = 'JHS 2';
  const schoolName = profile?.school_name || 'My School';

  const totalQuestions = 85;
  const avgAccuracy = 70;
  const subjectsThisWeek = 4;
  const learningScore = 72;

  const handleShareWithParent = () => {
    // Build a summary text
    const summary = `📊 ${studentName}'s Learning Progress\n\nClass: ${classGrade} | School: ${schoolName}\nLearning Score: ${learningScore}%\nSubjects studied this week: ${subjectsThisWeek}\nAverage accuracy: ${avgAccuracy}%\n\nStrong areas: Solving math questions, Science definitions\nNeeds work: Comprehension, Word problems\n\nPowered by Jesi AI`;
    
    // Try native share, fallback to clipboard
    if (navigator.share) {
      navigator.share({ title: `${studentName}'s Progress`, text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
      toast.success('Progress summary copied to clipboard! Share it with your parent.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold">Welcome, {studentName} 👋</h2>
          <p className="text-muted-foreground mt-1">
            Class: {classGrade} | School: {schoolName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Last updated: Today</p>
        </CardContent>
      </Card>

      {/* 🎯 Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🎯 Overall Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Learning Score:</span>
            <span className="text-amber-500 text-lg">⭐⭐⭐⭐☆</span>
            <span className="font-bold">({learningScore}%)</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <ArrowUp className="w-4 h-4" /> You are improving. Keep going! 📈
          </p>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{subjectsThisWeek}</p>
              <p className="text-xs text-muted-foreground">Subjects studied</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{totalQuestions}</p>
              <p className="text-xs text-muted-foreground">Questions answered</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{avgAccuracy}%</p>
              <p className="text-xs text-muted-foreground">Average accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Performance Trend
          </CardTitle>
          <CardDescription>Your average score progression over weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={progressTrend}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 📚 Subject Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Subject Breakdown</CardTitle>
          <CardDescription>Tap a subject to see details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {subjectBreakdown.map((subject) => (
            <div
              key={subject.name}
              className="rounded-lg border border-border overflow-hidden cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => setExpandedSubject(expandedSubject === subject.name ? null : subject.name)}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{subject.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{subject.name}</p>
                    <p className="text-xs text-muted-foreground">Understanding: {subject.understanding}</p>
                  </div>
                </div>
                <Badge variant="outline" style={{ borderColor: subject.color, color: subject.color }}>
                  {subject.accuracy}%
                </Badge>
              </div>
              {expandedSubject === subject.name && (
                <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                  <Progress value={subject.accuracy} className="h-2" />
                  {subject.strongTopics.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-green-600 mb-1">Strong topics:</p>
                      <div className="flex flex-wrap gap-1">
                        {subject.strongTopics.map(t => (
                          <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {subject.weakTopics.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-600 mb-1">Needs practice:</p>
                      <div className="flex flex-wrap gap-1">
                        {subject.weakTopics.map(t => (
                          <Badge key={t} variant="outline" className="text-xs border-amber-300 text-amber-600">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-2" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      // Navigate to practice with the weak topic pre-selected
                      const topic = subject.weakTopics[0] || subject.strongTopics[0] || '';
                      navigateToPractice(subject.name, topic);
                    }}
                  >
                    👉 Practice Now
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 🧠 Strengths & Gaps - full width now */}
      <Card>
        <CardHeader>
          <CardTitle>🧠 My Strengths & Gaps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-green-600 mb-2">You are good at:</p>
            <div className="space-y-1">
              {['Solving direct math questions', 'Science definitions', 'Grammar exercises'].map(s => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-600 mb-2">You need to work on:</p>
            <div className="space-y-1">
              {['Explaining answers in English', 'Long word problems'].map(s => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs font-medium text-primary mb-1">💡 Jesi AI Suggestion:</p>
            <p className="text-sm">"{aiRecommendation.message}"</p>
          </div>
          <Button 
            size="sm" 
            className="w-full" 
            onClick={() => navigateToPractice(aiRecommendation.subject, aiRecommendation.topic)}
          >
            Start Recommended Practice
          </Button>
        </CardContent>
      </Card>

      {/* 🕒 Study Habits */}
      <Card>
        <CardHeader>
          <CardTitle>🕒 My Study Habits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-xl font-bold">4 / 7</p>
              <p className="text-xs text-muted-foreground">Days studied this week</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-xl font-bold">6pm – 8pm</p>
              <p className="text-xs text-muted-foreground">Best study time</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-xl font-bold">25 min</p>
              <p className="text-xs text-muted-foreground">Avg daily study time</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">👍 Studying consistently helps you remember more.</p>
        </CardContent>
      </Card>

      {/* 📝 Exam Readiness */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Exam Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Mock exam scores per subject:</p>
          <div className="space-y-3">
            {mockExamScores.map((exam) => (
              <div key={exam.subject} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{exam.subject}</span>
                  <span className="font-bold">{exam.score}%</span>
                </div>
                <Progress value={exam.score} className="h-2" />
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium">🟡 Readiness Level: <span className="text-amber-600">Almost Ready</span></p>
            <p className="text-xs text-muted-foreground mt-1">Jesi AI recommends you revise: <strong>Ratio</strong>, <strong>Word problems</strong></p>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigateToPractice('Mathematics', 'Word problems')}>
            Revise for Test
          </Button>
        </CardContent>
      </Card>

      {/* 👨‍👩‍👧 Parent View */}
      <Card className="bg-gradient-to-r from-secondary/50 to-secondary/30">
        <CardHeader>
          <CardTitle>👨‍👩‍👧 What My Parents Can See</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1 text-sm">
            <p>✅ Subjects I'm improving in</p>
            <p>✅ Topics I need help with</p>
            <p>✅ My weekly study effort</p>
          </div>
          <Button variant="outline" size="sm" className="mt-3" onClick={handleShareWithParent}>
            📤 Share Progress with Parent
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentInsightZone;
