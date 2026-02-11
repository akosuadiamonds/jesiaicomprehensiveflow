import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  BarChart3, TrendingUp, Users, FileText, BookOpen, GraduationCap,
  Target, Sparkles, Wallet, ChevronRight, AlertTriangle, Eye,
  Bell, CheckCircle2, XCircle, Save, ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useLessonPlans } from '@/hooks/useLessonPlans';
import { useClassrooms } from '@/hooks/useClassrooms';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig
} from '@/components/ui/chart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';

const InsightsPage: React.FC = () => {
  const { profile } = useAuth();
  const { setCurrentPage } = useApp();
  const { plans: savedLessonPlans } = useLessonPlans();
  const { classrooms } = useClassrooms();

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [hwWeek, setHwWeek] = useState('1');
  const [studentFilter, setStudentFilter] = useState('');

  const totalLessonPlans = savedLessonPlans.length;

  // Summary cards
  const summaryCards = [
    { label: 'Lesson Plans', value: totalLessonPlans, icon: FileText, color: 'bg-primary/10 text-primary' },
    { label: 'Tests Created', value: 12, icon: GraduationCap, color: 'bg-accent/10 text-accent' },
    { label: 'Total Saved', value: totalLessonPlans + 12, icon: Save, color: 'bg-success/10 text-success' },
    { label: 'Revenue', value: 'GHS 450', icon: Wallet, color: 'bg-primary/10 text-primary' },
  ];

  const handleViewInsights = () => {
    if (selectedClass && selectedSubject) {
      setShowDashboard(true);
    }
  };

  // Mock data
  const engagementData: Record<string, { highly: number; moderate: number; inactive: number }> = {
    '1': { highly: 18, moderate: 10, inactive: 12 },
    '2': { highly: 22, moderate: 8, inactive: 10 },
    '3': { highly: 15, moderate: 12, inactive: 13 },
  };

  const hwData: Record<string, { assigned: number; completed: number; onTime: number; avg: number; failQ: string }> = {
    '1': { assigned: 40, completed: 30, onTime: 24, avg: 62, failQ: 'Question 4 failed by 70% of class' },
    '2': { assigned: 38, completed: 35, onTime: 30, avg: 71, failQ: 'Question 2 failed by 55% of class' },
    '3': { assigned: 40, completed: 28, onTime: 20, avg: 58, failQ: 'Question 6 failed by 65% of class' },
  };

  const engagement = engagementData[selectedWeek] || engagementData['1'];
  const hw = hwData[hwWeek] || hwData['1'];

  const engagementChartData = [
    { name: 'Highly Active', value: engagement.highly, fill: 'hsl(var(--success))' },
    { name: 'Moderate', value: engagement.moderate, fill: 'hsl(var(--accent))' },
    { name: 'Inactive', value: engagement.inactive, fill: 'hsl(var(--destructive))' },
  ];

  const chartConfig: ChartConfig = {
    value: { label: 'Students', color: 'hsl(var(--primary))' },
  };

  const mockStudents = [
    { name: 'Ama Mensah', trend: 'improving', scores: [65, 70, 75] },
    { name: 'Kofi Asante', trend: 'declining', scores: [80, 72, 60] },
    { name: 'Akua Boateng', trend: 'stagnant', scores: [55, 56, 55] },
    { name: 'Yaw Frimpong', trend: 'improving', scores: [50, 60, 72] },
    { name: 'Esi Appiah', trend: 'stagnant', scores: [68, 67, 69] },
    { name: 'Kwame Owusu', trend: 'declining', scores: [75, 65, 58] },
  ];

  const filteredStudents = mockStudents.filter(s =>
    s.name.toLowerCase().includes(studentFilter.toLowerCase())
  );

  const trendColor = (t: string) =>
    t === 'improving' ? 'text-success' : t === 'declining' ? 'text-destructive' : 'text-muted-foreground';
  const trendLabel = (t: string) =>
    t === 'improving' ? '📈 Improving' : t === 'declining' ? '📉 Declining' : '➡️ Stagnant';

  if (showDashboard) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8 space-y-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" onClick={() => setShowDashboard(false)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-foreground">
              {selectedClass} · {selectedSubject}
            </h1>
            <p className="text-sm text-muted-foreground">Class performance insights</p>
          </div>
        </div>

        {/* 1. Class Health Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">📊 Class Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-2xl font-bold text-primary">64%</p>
                <p className="text-xs text-muted-foreground">Class Average</p>
                <span className="text-xs text-success">⬆ improving</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-2xl font-bold text-foreground">32/40</p>
                <p className="text-xs text-muted-foreground">Active Students</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-2xl font-bold text-foreground">6/8</p>
                <p className="text-xs text-muted-foreground">Lessons Covered</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-lg font-bold text-foreground">🟡 Needs Support</p>
                <p className="text-xs text-muted-foreground">Overall Status</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Jesi AI Insight</span>
              </div>
              <p className="text-sm text-muted-foreground">
                "Your class is improving, but engagement dropped this week."
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 2. Key Learning Gaps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">🔍 Key Learning Gaps (Top 3)</CardTitle>
              <CardDescription>Topics students struggle with most</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { topic: 'Word Problems', accuracy: 58 },
                { topic: 'Ratios', accuracy: 61 },
                { topic: 'Fractions', accuracy: 65 },
              ].map((gap, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{gap.topic}</p>
                    <p className="text-xs text-muted-foreground">{gap.accuracy}% accuracy</p>
                  </div>
                  <Progress value={gap.accuracy} className="w-20 h-2" />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setCurrentPage('planner')}>
                  Reteach Topic
                </Button>
                <Button size="sm" onClick={() => setCurrentPage('test')}>
                  Assign Practice
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 3. At-Risk Students */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">⚠️ At-Risk Students Alert</CardTitle>
              <CardDescription>Students needing immediate support</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span className="font-semibold text-destructive">5 students flagged</span>
              </div>
              <div className="space-y-2 mb-4">
                {['Low engagement', 'Repeated low scores', 'Missed homework'].map((reason, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <XCircle className="w-3.5 h-3.5 text-destructive" />
                    {reason}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setCurrentPage('classroom')}>
                  <Eye className="w-3.5 h-3.5 mr-1" /> View Students
                </Button>
                <Button size="sm" variant="outline">
                  <Bell className="w-3.5 h-3.5 mr-1" /> Send Reminder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. Lesson Effectiveness */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">📘 Lesson Effectiveness</CardTitle>
            <CardDescription>How your last lesson performed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Lesson Objective Met</p>
                <p className="text-lg font-bold text-foreground">❌ Partially</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Students Who Understood</p>
                <p className="text-lg font-bold text-primary">60%</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground">Most Confusing Part</p>
                <p className="text-lg font-bold text-foreground">Word problem examples</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 5. Student Engagement Tracker */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">📈 Student Engagement</CardTitle>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Week 1</SelectItem>
                    <SelectItem value="2">Week 2</SelectItem>
                    <SelectItem value="3">Week 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[180px]">
                <PieChart>
                  <Pie data={engagementChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {engagementChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-2">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Highly Active ({engagement.highly})</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Moderate ({engagement.moderate})</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> Inactive ({engagement.inactive})</span>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">📊 Best activity time: 6pm – 8pm</p>
            </CardContent>
          </Card>

          {/* 6. Homework & Assessment Snapshot */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">📝 Homework & Assessment</CardTitle>
                <Select value={hwWeek} onValueChange={setHwWeek}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Week 1</SelectItem>
                    <SelectItem value="2">Week 2</SelectItem>
                    <SelectItem value="3">Week 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-foreground">{hw.assigned}</p>
                  <p className="text-xs text-muted-foreground">Assigned</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-foreground">{hw.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-foreground">{hw.onTime}</p>
                  <p className="text-xs text-muted-foreground">On Time</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-primary">{hw.avg}%</p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-xs text-destructive">
                <AlertTriangle className="w-3.5 h-3.5" />
                {hw.failQ}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs">Review Question</Button>
                <Button size="sm" variant="outline" className="text-xs">Edit Homework</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 7. Individual Student Progress */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-lg">👤 Individual Student Progress</CardTitle>
                <CardDescription>Quick scan view</CardDescription>
              </div>
              <Input
                placeholder="Filter by student name..."
                className="w-56 h-8 text-sm"
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4 text-sm">
              <Badge variant="outline" className="border-success text-success">📈 Improving: {mockStudents.filter(s => s.trend === 'improving').length}</Badge>
              <Badge variant="outline" className="border-muted-foreground text-muted-foreground">➡️ Stagnant: {mockStudents.filter(s => s.trend === 'stagnant').length}</Badge>
              <Badge variant="outline" className="border-destructive text-destructive">📉 Declining: {mockStudents.filter(s => s.trend === 'declining').length}</Badge>
            </div>
            <div className="space-y-2">
              {filteredStudents.map((student, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{student.name}</p>
                      <p className={`text-xs ${trendColor(student.trend)}`}>{trendLabel(student.trend)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {student.scores.map((s, j) => (
                        <span key={j} className="text-xs px-1.5 py-0.5 rounded bg-background border border-border">{s}%</span>
                      ))}
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setCurrentPage('classroom')}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 9. Jesi AI Recommendations */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Jesi AI Recommendations
            </CardTitle>
            <CardDescription>What to do next</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {[
                'Reteach word problems using real-life examples',
                'Group 5 at-risk students for extra support',
                'Assign 10-question practice on ratios',
              ].map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span className="text-foreground">{rec}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setCurrentPage('planner')}>Apply All</Button>
              <Button size="sm" variant="outline">Customize</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default view: summary + focus selector
  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Insights & Analytics</h1>
        <p className="text-muted-foreground">Track your teaching progress and get AI-powered recommendations</p>
      </div>

      {/* Subject Coverage Summary Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" /> Subject Coverage
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Choose Focus Card */}
      <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Choose Your Focus
          </CardTitle>
          <CardDescription>Select a class and subject to view detailed insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classrooms.length > 0 ? (
                  classrooms.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="JHS 1">JHS 1</SelectItem>
                    <SelectItem value="JHS 2">JHS 2</SelectItem>
                    <SelectItem value="JHS 3">JHS 3</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {profile?.subjects && profile.subjects.length > 0 ? (
                  profile.subjects.map((s, i) => (
                    <SelectItem key={i} value={s}>{s}</SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English Language">English Language</SelectItem>
                    <SelectItem value="Integrated Science">Integrated Science</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            <Button
              onClick={handleViewInsights}
              disabled={!selectedClass || !selectedSubject}
              className="shrink-0"
            >
              View Insights <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsPage;
