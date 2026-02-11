import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  BarChart3, TrendingUp, Users, FileText, BookOpen, GraduationCap,
  Target, Sparkles, Wallet, ChevronRight, AlertTriangle, Eye,
  Bell, CheckCircle2, XCircle, Save, ArrowLeft, Download, User
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
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [hwWeek, setHwWeek] = useState('1');
  const [studentFilter, setStudentFilter] = useState('');
  const [showAtRiskModal, setShowAtRiskModal] = useState(false);
  const [gapsFilter, setGapsFilter] = useState<'week' | 'month'>('week');
  const [atRiskFilter, setAtRiskFilter] = useState<'week' | 'month'>('week');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [showStudentProfile, setShowStudentProfile] = useState<any>(null);
  const [detailSubjectFilter, setDetailSubjectFilter] = useState('all');
  const [detailTimeFilter, setDetailTimeFilter] = useState<'week' | 'month'>('week');

  const totalLessonPlans = savedLessonPlans.length;

  // Summary cards
  const summaryCards = [
    { label: 'Lesson Plans', value: totalLessonPlans, icon: FileText, color: 'bg-primary/10 text-primary' },
    { label: 'Tests Created', value: 12, icon: GraduationCap, color: 'bg-accent/10 text-accent' },
    { label: 'Hours Saved', value: totalLessonPlans + 12, icon: Save, color: 'bg-success/10 text-success' },
    { label: 'Revenue', value: 'GHS 450', icon: Wallet, color: 'bg-primary/10 text-primary' },
  ];

  // Mock at-risk students data with detailed info
  const atRiskStudents = [
    { name: 'Kwame Owusu', trend: 'declining', reason: 'Repeated low scores', lastScore: 58, class: 'JHS 2', subject: 'Mathematics', attendance: '65%', avgScore: 55, testsCompleted: 8, joinedDate: '2025-09-15' },
    { name: 'Akua Boateng', trend: 'stagnant', reason: 'Low engagement', lastScore: 55, class: 'JHS 2', subject: 'Mathematics', attendance: '70%', avgScore: 52, testsCompleted: 6, joinedDate: '2025-09-20' },
    { name: 'Kofi Asante', trend: 'declining', reason: 'Missed homework', lastScore: 60, class: 'JHS 1', subject: 'English', attendance: '60%', avgScore: 58, testsCompleted: 7, joinedDate: '2025-10-01' },
    { name: 'Esi Appiah', trend: 'stagnant', reason: 'Low test performance', lastScore: 56, class: 'JHS 3', subject: 'Science', attendance: '75%', avgScore: 54, testsCompleted: 9, joinedDate: '2025-09-10' },
    { name: 'Yaw Mensah', trend: 'declining', reason: 'Missed multiple sessions', lastScore: 48, class: 'JHS 2', subject: 'Mathematics', attendance: '50%', avgScore: 45, testsCompleted: 5, joinedDate: '2025-10-05' },
  ];

  // Mock detailed test scores for individual student progress
  const mockStudentTests = [
    { test: 'Mid-Term Exam', subject: 'Mathematics', score: 72, avgScore: 68, weight20: 13.6, date: '2025-11-15' },
    { test: 'Quiz 3 - Fractions', subject: 'Mathematics', score: 65, avgScore: 70, weight20: 14.0, date: '2025-11-08' },
    { test: 'Weekly Test 5', subject: 'Mathematics', score: 80, avgScore: 72, weight20: 14.4, date: '2025-11-01' },
    { test: 'Quiz 2 - Ratios', subject: 'Mathematics', score: 58, avgScore: 65, weight20: 13.0, date: '2025-10-25' },
    { test: 'Weekly Test 4', subject: 'English Language', score: 75, avgScore: 71, weight20: 14.2, date: '2025-10-18' },
    { test: 'Quiz 1 - Grammar', subject: 'English Language', score: 82, avgScore: 74, weight20: 14.8, date: '2025-10-11' },
  ];

  const handleViewInsights = () => {
    if (selectedClass) {
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
              {selectedClass}
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
                <Button size="sm" variant="outline" onClick={() => setShowAtRiskModal(true)}>
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
                <CardDescription>Click a student for detailed scores</CardDescription>
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
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors" onClick={() => { setSelectedStudentDetail(student); setShowStudentDetailModal(true); }}>
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
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 8. Jesi AI Recommendations */}
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

        {/* Modal for At-Risk Students Details */}
        <Dialog open={showAtRiskModal} onOpenChange={setShowAtRiskModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>At-Risk Students - Detailed View</DialogTitle>
              <DialogDescription>Students flagged for immediate support and intervention</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {atRiskStudents.map((student, i) => (
                <div key={i} className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center text-sm font-bold text-destructive">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">Last Score: {student.lastScore}%</p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="shrink-0">{student.trend === 'declining' ? '📉 Declining' : '➡️ Stagnant'}</Badge>
                  </div>
                  <div className="ml-13 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">{student.reason}</span>
                  </div>
                  <div className="mt-3">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => { setShowStudentProfile(student); setShowAtRiskModal(false); }}>
                      <User className="w-3.5 h-3.5 mr-1" /> View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Student Profile Modal */}
        <Dialog open={!!showStudentProfile} onOpenChange={(open) => !open && setShowStudentProfile(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Student Profile</DialogTitle>
              <DialogDescription>Detailed information about the student</DialogDescription>
            </DialogHeader>
            {showStudentProfile && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                    {showStudentProfile.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{showStudentProfile.name}</h3>
                    <p className="text-sm text-muted-foreground">{showStudentProfile.class} · {showStudentProfile.subject}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Attendance</p>
                    <p className="text-lg font-bold text-foreground">{showStudentProfile.attendance}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Average Score</p>
                    <p className="text-lg font-bold text-foreground">{showStudentProfile.avgScore}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Tests Completed</p>
                    <p className="text-lg font-bold text-foreground">{showStudentProfile.testsCompleted}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Last Score</p>
                    <p className="text-lg font-bold text-foreground">{showStudentProfile.lastScore}%</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Trend</p>
                  <Badge variant="destructive" className="mt-1">{showStudentProfile.trend === 'declining' ? '📉 Declining' : '➡️ Stagnant'}</Badge>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-xs text-muted-foreground mb-1">Alert Reason</p>
                  <p className="text-sm text-destructive font-medium">{showStudentProfile.reason}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p className="text-sm font-medium text-foreground">{new Date(showStudentProfile.joinedDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Individual Student Scores Detail Modal */}
        <Dialog open={showStudentDetailModal} onOpenChange={setShowStudentDetailModal}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedStudentDetail?.name} - Detailed Scores</DialogTitle>
              <DialogDescription>Raw test scores and performance breakdown</DialogDescription>
            </DialogHeader>
            {selectedStudentDetail && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={detailSubjectFilter} onValueChange={setDetailSubjectFilter}>
                    <SelectTrigger className="w-40 h-8 text-xs">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="English Language">English Language</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    {(['week', 'month'] as const).map(f => (
                      <Button key={f} size="sm" variant={detailTimeFilter === f ? 'default' : 'outline'} className="text-xs h-8 px-3" onClick={() => setDetailTimeFilter(f)}>
                        {f === 'week' ? 'This Week' : 'This Month'}
                      </Button>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto text-xs h-8" onClick={() => {
                    const csv = 'Test,Subject,Score,Avg Score,20% of Avg\n' + mockStudentTests.filter(t => detailSubjectFilter === 'all' || t.subject === detailSubjectFilter).map(t => `${t.test},${t.subject},${t.score},${t.avgScore},${t.weight20}`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `${selectedStudentDetail.name}_scores.csv`; a.click();
                  }}>
                    <Download className="w-3.5 h-3.5 mr-1" /> Download CSV
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Avg Score</TableHead>
                      <TableHead className="text-right">20% of Avg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStudentTests
                      .filter(t => detailSubjectFilter === 'all' || t.subject === detailSubjectFilter)
                      .map((t, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{t.test}</TableCell>
                        <TableCell>{t.subject}</TableCell>
                        <TableCell className="text-right">
                          <span className={t.score >= t.avgScore ? 'text-success' : 'text-destructive'}>{t.score}%</span>
                        </TableCell>
                        <TableCell className="text-right">{t.avgScore}%</TableCell>
                        <TableCell className="text-right">{t.weight20}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogContent>
        </Dialog>
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
          <CardDescription>Select a class to view detailed insights</CardDescription>
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

            <Button
              onClick={handleViewInsights}
              disabled={!selectedClass}
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
