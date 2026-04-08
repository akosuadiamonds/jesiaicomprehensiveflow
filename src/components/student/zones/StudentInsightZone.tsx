import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  Brain, ArrowUp, CheckCircle2, AlertTriangle, Mail, Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudent } from '@/contexts/StudentContext';
import { toast } from 'sonner';

// --- Filter chip component ---
const FilterChips: React.FC<{ options: string[]; value: string; onChange: (v: string) => void }> = ({ options, value, onChange }) => (
  <div className="flex gap-1 flex-wrap">
    {options.map(opt => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
          value === opt
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

// --- Mock data sets per filter ---
const progressDataByFilter: Record<string, { learningScore: number; totalQuestions: number; avgAccuracy: number; subjectsStudied: number; trend: { week: string; score: number }[] }> = {
  'Today': { learningScore: 68, totalQuestions: 12, avgAccuracy: 67, subjectsStudied: 2, trend: [{ week: '9am', score: 65 }, { week: '12pm', score: 70 }, { week: '3pm', score: 68 }] },
  'This Week': { learningScore: 72, totalQuestions: 85, avgAccuracy: 70, subjectsStudied: 4, trend: [{ week: 'Mon', score: 65 }, { week: 'Tue', score: 68 }, { week: 'Wed', score: 72 }, { week: 'Thu', score: 70 }, { week: 'Fri', score: 74 }] },
  'This Month': { learningScore: 75, totalQuestions: 320, avgAccuracy: 73, subjectsStudied: 6, trend: [{ week: 'Week 1', score: 60 }, { week: 'Week 2', score: 65 }, { week: 'Week 3', score: 68 }, { week: 'Week 4', score: 75 }] },
};

const subjectBreakdown = [
  { name: 'Mathematics', emoji: '🟢', understanding: 'Good', accuracy: 75, strongTopics: ['Fractions', 'Linear equations'], weakTopics: ['Word problems'], color: '#22C55E' },
  { name: 'English Language', emoji: '🟡', understanding: 'Fair', accuracy: 62, strongTopics: ['Grammar', 'Vocabulary'], weakTopics: ['Comprehension'], color: '#EAB308' },
  { name: 'Integrated Science', emoji: '🔵', understanding: 'Very Good', accuracy: 80, strongTopics: ['Photosynthesis', 'The human body'], weakTopics: [], color: '#3B82F6' },
  { name: 'Social Studies', emoji: '🟢', understanding: 'Good', accuracy: 78, strongTopics: ['Ghana history', 'Government'], weakTopics: ['Map reading'], color: '#22C55E' },
];

const subjectByMonth = [
  { name: 'Mathematics', emoji: '🟢', understanding: 'Good', accuracy: 72, strongTopics: ['Fractions'], weakTopics: ['Word problems', 'Ratios'], color: '#22C55E' },
  { name: 'English Language', emoji: '🟡', understanding: 'Fair', accuracy: 60, strongTopics: ['Grammar'], weakTopics: ['Comprehension', 'Essay writing'], color: '#EAB308' },
  { name: 'Integrated Science', emoji: '🔵', understanding: 'Very Good', accuracy: 78, strongTopics: ['Photosynthesis', 'The human body'], weakTopics: ['Chemical reactions'], color: '#3B82F6' },
  { name: 'Social Studies', emoji: '🟢', understanding: 'Good', accuracy: 76, strongTopics: ['Ghana history'], weakTopics: ['Map reading', 'Trade'], color: '#22C55E' },
];

const strengthsByMonth: Record<string, { strengths: string[]; gaps: string[] }> = {
  'This Month': { strengths: ['Solving direct math questions', 'Science definitions', 'Grammar exercises'], gaps: ['Explaining answers in English', 'Long word problems'] },
};

const studyHabitsData: Record<string, { daysStudied: string; bestTime: string; avgTime: string }> = {
  'Today': { daysStudied: '1 / 1', bestTime: '7pm – 8pm', avgTime: '35 min' },
  'This Week': { daysStudied: '4 / 7', bestTime: '6pm – 8pm', avgTime: '25 min' },
  'This Month': { daysStudied: '18 / 30', bestTime: '6pm – 9pm', avgTime: '28 min' },
};

const examScoresData: Record<string, { subject: string; score: number; total: number }[]> = {
  'This Week': [
    { subject: 'Mathematics', score: 68, total: 100 },
    { subject: 'English', score: 55, total: 100 },
    { subject: 'Science', score: 78, total: 100 },
    { subject: 'Social Studies', score: 72, total: 100 },
  ],
  'This Month': [
    { subject: 'Mathematics', score: 65, total: 100 },
    { subject: 'English', score: 58, total: 100 },
    { subject: 'Science', score: 75, total: 100 },
    { subject: 'Social Studies', score: 70, total: 100 },
  ],
};

const aiRecommendation = {
  message: "Practice 10 comprehension questions today.",
  subject: "English Language",
  topic: "Comprehension",
};

const StudentInsightZone: React.FC = () => {
  const { profile } = useAuth();
  const { navigateToPractice } = useStudent();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Filter states
  const [progressFilter, setProgressFilter] = useState('This Week');
  const [subjectFilter, setSubjectFilter] = useState('This Week');
  const [strengthsFilter, setStrengthsFilter] = useState('This Month');
  const [habitsFilter, setHabitsFilter] = useState('This Week');
  const [examFilter, setExamFilter] = useState('This Week');

  // Parent share modal
  const [showShareModal, setShowShareModal] = useState(false);
  const [parentEmail, setParentEmail] = useState('');

  const studentName = profile?.first_name || 'Student';
  const classGrade = 'JHS 2';
  const schoolName = profile?.school_name || 'My School';

  const pData = progressDataByFilter[progressFilter] || progressDataByFilter['This Week'];
  const currentSubjects = subjectFilter === 'This Month' ? subjectByMonth : subjectBreakdown;
  const currentStrengths = strengthsByMonth[strengthsFilter] || strengthsByMonth['This Month'];
  const currentHabits = studyHabitsData[habitsFilter] || studyHabitsData['This Week'];
  const currentExamScores = examScoresData[examFilter] || examScoresData['This Week'];

  const improvingSubjects = currentSubjects.filter(s => s.accuracy >= 70);
  const weakTopicsAll = currentSubjects.flatMap(s => s.weakTopics.map(t => `${t} (${s.name})`));

  const handleSendToParent = () => {
    if (!parentEmail.trim()) {
      toast.error('Please enter a parent email address.');
      return;
    }
    const summary = `📊 ${studentName}'s Learning Progress\n\nClass: ${classGrade} | School: ${schoolName}\nLearning Score: ${pData.learningScore}%\nSubjects studied: ${pData.subjectsStudied}\nAverage accuracy: ${pData.avgAccuracy}%\n\nImproving in: ${improvingSubjects.map(s => s.name).join(', ')}\nNeeds work: ${weakTopicsAll.join(', ')}\nStudy effort: ${currentHabits.daysStudied} days, ${currentHabits.avgTime} avg\n\nPowered by Jesi AI`;

    if (navigator.share) {
      navigator.share({ title: `${studentName}'s Progress`, text: summary }).catch(() => {});
    } else {
      navigator.clipboard.writeText(summary);
    }
    toast.success(`Progress summary ready to share with ${parentEmail}!`);
    setShowShareModal(false);
    setParentEmail('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold">Welcome, {studentName} 👋</h2>
          <p className="text-muted-foreground mt-1">Class: {classGrade} | School: {schoolName}</p>
          <p className="text-xs text-muted-foreground mt-1">Last updated: Today</p>
        </CardContent>
      </Card>

      {/* 🎯 Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">🎯 Overall Progress</CardTitle>
            <FilterChips options={['Today', 'This Week', 'This Month']} value={progressFilter} onChange={setProgressFilter} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Learning Score:</span>
            <span className="text-amber-500 text-lg">⭐⭐⭐⭐☆</span>
            <span className="font-bold">({pData.learningScore}%)</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <ArrowUp className="w-4 h-4" /> You are improving. Keep going! 📈
          </p>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{pData.subjectsStudied}</p>
              <p className="text-xs text-muted-foreground">Subjects studied</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{pData.totalQuestions}</p>
              <p className="text-xs text-muted-foreground">Questions answered</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{pData.avgAccuracy}%</p>
              <p className="text-xs text-muted-foreground">Average accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5" /> Performance Trend</CardTitle>
          <CardDescription>Score progression ({progressFilter.toLowerCase()})</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={pData.trend}>
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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>📚 Subject Breakdown</CardTitle>
              <CardDescription>Tap a subject to see details</CardDescription>
            </div>
            <FilterChips options={['This Week', 'This Month']} value={subjectFilter} onChange={setSubjectFilter} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentSubjects.map((subject) => (
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
                <Badge variant="outline" style={{ borderColor: subject.color, color: subject.color }}>{subject.accuracy}%</Badge>
              </div>
              {expandedSubject === subject.name && (
                <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                  <Progress value={subject.accuracy} className="h-2" />
                  {subject.strongTopics.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-green-600 mb-1">Strong topics:</p>
                      <div className="flex flex-wrap gap-1">
                        {subject.strongTopics.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                      </div>
                    </div>
                  )}
                  {subject.weakTopics.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-600 mb-1">Needs practice:</p>
                      <div className="flex flex-wrap gap-1">
                        {subject.weakTopics.map(t => <Badge key={t} variant="outline" className="text-xs border-amber-300 text-amber-600">{t}</Badge>)}
                      </div>
                    </div>
                  )}
                  <Button size="sm" variant="outline" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); navigateToPractice(subject.name, subject.weakTopics[0] || subject.strongTopics[0] || ''); }}>
                    👉 Practice Now
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 🧠 Strengths & Gaps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>🧠 My Strengths & Gaps</CardTitle>
            <FilterChips options={['This Month']} value={strengthsFilter} onChange={setStrengthsFilter} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-green-600 mb-2">You are good at:</p>
            <div className="space-y-1">
              {currentStrengths.strengths.map(s => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /><span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-600 mb-2">You need to work on:</p>
            <div className="space-y-1">
              {currentStrengths.gaps.map(s => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /><span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs font-medium text-primary mb-1">💡 Jesi AI Suggestion:</p>
            <p className="text-sm">"{aiRecommendation.message}"</p>
          </div>
          <Button size="sm" className="w-full" onClick={() => navigateToPractice(aiRecommendation.subject, aiRecommendation.topic)}>
            Start Recommended Practice
          </Button>
        </CardContent>
      </Card>

      {/* 🕒 Study Habits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>🕒 My Study Habits</CardTitle>
            <FilterChips options={['Today', 'This Week', 'This Month']} value={habitsFilter} onChange={setHabitsFilter} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-xl font-bold">{currentHabits.daysStudied}</p>
              <p className="text-xs text-muted-foreground">Days studied</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-xl font-bold">{currentHabits.bestTime}</p>
              <p className="text-xs text-muted-foreground">Best study time</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-xl font-bold">{currentHabits.avgTime}</p>
              <p className="text-xs text-muted-foreground">Avg daily study time</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">👍 Studying consistently helps you remember more.</p>
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
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowShareModal(true)}>
            📤 Share Progress with Parent
          </Button>
        </CardContent>
      </Card>

      {/* Parent Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📤 Share Progress with Parent</DialogTitle>
            <DialogDescription>Review the summary below before sharing</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Improving Subjects */}
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">📈 Subjects I'm Improving In</p>
              <div className="space-y-1">
                {improvingSubjects.map(s => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <span>{s.emoji} {s.name}</span>
                    <Badge variant="secondary" className="text-xs">{s.accuracy}% accuracy</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak Topics */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">⚠️ Topics I Need Help With</p>
              <div className="flex flex-wrap gap-1">
                {weakTopicsAll.length > 0 ? weakTopicsAll.map(t => (
                  <Badge key={t} variant="outline" className="text-xs border-amber-300 text-amber-600">{t}</Badge>
                )) : <p className="text-xs text-muted-foreground">No weak topics — great job!</p>}
              </div>
            </div>

            {/* Study Effort */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">📚 Weekly Study Effort</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold">{currentHabits.daysStudied}</p>
                  <p className="text-xs text-muted-foreground">Days</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{currentHabits.avgTime}</p>
                  <p className="text-xs text-muted-foreground">Avg/day</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{pData.learningScore}%</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="parent-email" className="text-sm">Parent's Email</Label>
              <div className="flex gap-2">
                <Input
                  id="parent-email"
                  type="email"
                  placeholder="parent@email.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowShareModal(false)}>Cancel</Button>
            <Button onClick={handleSendToParent} className="gap-2">
              <Send className="w-4 h-4" /> Send to Parent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentInsightZone;
