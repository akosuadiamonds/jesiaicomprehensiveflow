import React, { useEffect, useState } from 'react';
import { useAdmin } from '../SchoolAdminApp';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, GraduationCap, TrendingUp, Activity, BookOpen, BarChart3, AlertTriangle, CheckCircle2, Brain, ChevronRight, School, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SectionFilters: React.FC<{
  classFilter: string; onClassChange: (v: string) => void;
  weekFilter: string; onWeekChange: (v: string) => void;
  termFilter: string; onTermChange: (v: string) => void;
  yearFilter: string; onYearChange: (v: string) => void;
}> = ({ classFilter, onClassChange, weekFilter, onWeekChange, termFilter, onTermChange, yearFilter, onYearChange }) => (
  <div className="flex gap-2 flex-wrap">
    <Select value={classFilter} onValueChange={onClassChange}>
      <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Select Class" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Classes</SelectItem>
        <SelectItem value="basic1">Basic 1</SelectItem>
        <SelectItem value="basic2">Basic 2</SelectItem>
        <SelectItem value="basic3">Basic 3</SelectItem>
        <SelectItem value="basic4">Basic 4</SelectItem>
        <SelectItem value="basic5">Basic 5</SelectItem>
        <SelectItem value="basic6">Basic 6</SelectItem>
        <SelectItem value="jhs1">JHS 1</SelectItem>
        <SelectItem value="jhs2">JHS 2</SelectItem>
        <SelectItem value="jhs3">JHS 3</SelectItem>
      </SelectContent>
    </Select>
    <Select value={weekFilter} onValueChange={onWeekChange}>
      <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Week" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Weeks</SelectItem>
        {Array.from({ length: 14 }, (_, i) => (
          <SelectItem key={i + 1} value={`week_${i + 1}`}>Week {i + 1}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select value={termFilter} onValueChange={onTermChange}>
      <SelectTrigger className="w-[110px] h-8 text-xs"><SelectValue placeholder="Term" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Terms</SelectItem>
        <SelectItem value="term1">Term 1</SelectItem>
        <SelectItem value="term2">Term 2</SelectItem>
        <SelectItem value="term3">Term 3</SelectItem>
      </SelectContent>
    </Select>
    <Select value={yearFilter} onValueChange={onYearChange}>
      <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Academic Year" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Years</SelectItem>
        <SelectItem value="2025-2026">2025/2026</SelectItem>
        <SelectItem value="2024-2025">2024/2025</SelectItem>
        <SelectItem value="2023-2024">2023/2024</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

const AdminInsights: React.FC = () => {
  const { institution } = useAdmin();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState<any[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<any[]>([]);

  // Filters
  
  const [classFilter, setClassFilter] = useState('all');
  const [tchWeek, setTchWeek] = useState('week');
  const [tchTerm, setTchTerm] = useState('all');
  const [tchYear, setTchYear] = useState('all');
  const [tchClass, setTchClass] = useState('all');
  const [curWeek, setCurWeek] = useState('week');
  const [curTerm, setCurTerm] = useState('all');
  const [curYear, setCurYear] = useState('all');
  const [curClass, setCurClass] = useState('all');
  const [engWeekFilter, setEngWeekFilter] = useState('week');
  const [engTermFilter, setEngTermFilter] = useState('all');
  const [engYearFilter, setEngYearFilter] = useState('all');
  const [showAtRisk, setShowAtRisk] = useState(false);
  const [showTeacherInsights, setShowTeacherInsights] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showClassBreakdown, setShowClassBreakdown] = useState(false);
  const [perfTimeFilter, setPerfTimeFilter] = useState('week');
  const [perfTermFilter, setPerfTermFilter] = useState('all');
  const [perfYearFilter, setPerfYearFilter] = useState('all');

  useEffect(() => {
    if (!institution) return;
    const fetchData = async () => {
      const [membersRes, profilesRes] = await Promise.all([
        supabase
          .from('institution_members')
          .select('user_id, member_role, is_active, joined_at')
          .eq('institution_id', institution.id),
        supabase
          .from('profiles')
          .select('user_id, first_name, last_name, user_role, subjects, class_grade, school_name'),
      ]);

      setMemberData(membersRes.data as any[] || []);
      setMemberProfiles(profilesRes.data as any[] || []);
      setLoading(false);
    };
    fetchData();
  }, [institution]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const activeMembers = memberData.filter(m => m.is_active);
  const activeTeachers = activeMembers.filter(m => m.member_role === 'teacher');
  const activeStudents = activeMembers.filter(m => m.member_role === 'student');

  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const recentJoins = memberData.filter(m => new Date(m.joined_at) >= weekAgo).length;

  // Mock academic data (would come from real queries in production)
  const schoolAvgScore = 66;
  const performanceTrend = 'improving';

  const subjectPerformance = [
    { name: 'Integrated Science', score: 74, status: 'good' },
    { name: 'Mathematics', score: 61, status: 'warning' },
    { name: 'English Language', score: 63, status: 'warning' },
    { name: 'Social Studies', score: 71, status: 'good' },
    { name: 'ICT', score: 78, status: 'good' },
    { name: 'French', score: 55, status: 'warning' },
  ];

  const classesNeedingSupport = [
    { class: 'JHS 2', subject: 'Mathematics' },
    { class: 'SHS 1', subject: 'English' },
    { class: 'JHS 3', subject: 'French' },
  ];

  // Teacher engagement mock
  const highlyActive = Math.round(activeTeachers.length * 0.5);
  const moderatelyActive = Math.round(activeTeachers.length * 0.33);
  const lowActivity = activeTeachers.length - highlyActive - moderatelyActive;

  const teacherProfiles = memberProfiles.filter(p => activeTeachers.some(t => t.user_id === p.user_id));

  const topReasons = ['Strong class improvement', 'High student engagement', 'Consistent lesson delivery'];
  const topTeachers = teacherProfiles.length > 0
    ? teacherProfiles.slice(0, 2).map((p, i) => ({ name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown', note: topReasons[i % topReasons.length], subjects: p.subjects || [], classGrade: p.class_grade }))
    : [{ name: 'Ama Mensah', note: 'Strong class improvement', subjects: ['Mathematics'], classGrade: 'JHS 2' }, { name: 'Kofi Asante', note: 'High student engagement', subjects: ['English'], classGrade: 'SHS 1' }];

  const needSupportTeachers = teacherProfiles.length > 0
    ? teacherProfiles.slice(-1).map(p => ({ name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown', note: 'Low platform usage', subjects: p.subjects || [], classGrade: p.class_grade }))
    : [{ name: 'Yaa Boateng', note: 'Low platform usage', subjects: ['Science'], classGrade: 'JHS 3' }];

  // Student engagement
  const totalStudents = activeStudents.length || 50;
  const atRiskCount = Math.round(totalStudents * 0.12);
  const activeLearnersCount = Math.round(totalStudents * 0.68);
  const inactiveLearners = totalStudents - activeLearnersCount - atRiskCount;

  const atRiskStudentsMock = [
    { name: 'Ama Darko', class: 'JHS 2', avgScore: 32, subject: 'Mathematics' },
    { name: 'Kwame Mensah', class: 'Basic 6', avgScore: 28, subject: 'English' },
    { name: 'Abena Owusu', class: 'JHS 1', avgScore: 35, subject: 'Science' },
    { name: 'Yaw Asante', class: 'JHS 3', avgScore: 38, subject: 'Mathematics' },
    { name: 'Efua Boateng', class: 'Basic 5', avgScore: 25, subject: 'French' },
  ];

  // Curriculum mock
  const curriculumCoverage = [
    { subject: 'Mathematics', coverage: 72 },
    { subject: 'English', coverage: 68 },
    { subject: 'Science', coverage: 81 },
    { subject: 'Social Studies', coverage: 75 },
  ];
  const classesWithAssessments = 75;

  const performanceEmoji = schoolAvgScore >= 70 ? '🟢' : schoolAvgScore >= 50 ? '🟡' : '🔴';
  const performanceLabel = schoolAvgScore >= 70 ? 'Good' : schoolAvgScore >= 50 ? 'Needs Attention' : 'Critical';

  const recommendations = [
    'Increase Mathematics practice across JHS',
    'Support low-activity teachers with training sessions',
    `Initiate intervention for ${atRiskCount} at-risk students`,
    'Accelerate English curriculum coverage',
  ];

  const currentTerm = 'Term 2 / 2025-2026';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">School Admin Insights</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>👤 Administrator: {profile?.first_name} {profile?.last_name}</span>
          <span>🏫 School: {institution?.name}</span>
          <span>📅 Academic Term: {currentTerm}</span>
          <span>🕒 Last Updated: Today</span>
        </div>
      </div>


      {/* Teacher Effectiveness & Activity */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg">Teacher Effectiveness & Activity</CardTitle>
              <CardDescription>Engagement and performance of teaching staff</CardDescription>
            </div>
            <SectionFilters classFilter={tchClass} onClassChange={setTchClass} weekFilter={tchWeek} onWeekChange={setTchWeek} termFilter={tchTerm} onTermChange={setTchTerm} yearFilter={tchYear} onYearChange={setTchYear} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-3">👩🏽‍🏫 Teacher Engagement</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-center">
                <p className="text-2xl font-bold text-foreground">{highlyActive}</p>
                <p className="text-xs text-muted-foreground">Highly Active</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-center">
                <p className="text-2xl font-bold text-foreground">{moderatelyActive}</p>
                <p className="text-xs text-muted-foreground">Moderately Active</p>
              </div>
              <div className="p-3 rounded-xl bg-destructive/10 text-center">
                <p className="text-2xl font-bold text-foreground">{lowActivity}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">Low Activity <span className="text-amber-500">⚠</span></p>
              </div>
            </div>
          </div>

          {topTeachers.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">⭐ Top Performing Teachers</p>
              <div className="space-y-2">
                {topTeachers.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <span className="text-sm text-foreground">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {needSupportTeachers.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">⚠ Teachers Needing Support</p>
              <div className="space-y-2">
                {needSupportTeachers.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                    <span className="text-sm text-foreground">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowTeacherInsights(true)}>
            <Eye className="w-3.5 h-3.5" /> View Teacher Insights
          </Button>
        </CardContent>
      </Card>

      {/* Curriculum & Assessment Compliance */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg">Curriculum & Assessment Compliance</CardTitle>
              <CardDescription>Coverage and assessment activity tracking</CardDescription>
            </div>
              <SectionFilters classFilter={curClass} onClassChange={setCurClass} weekFilter={curWeek} onWeekChange={setCurWeek} termFilter={curTerm} onTermChange={setCurTerm} yearFilter={curYear} onYearChange={setCurYear} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-3">📘 Curriculum Coverage</p>
            <div className="space-y-3">
              {curriculumCoverage.map((c) => (
                <div key={c.subject} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{c.subject}</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      {c.coverage}% Covered
                      {c.coverage < 70 && <span className="text-amber-500">⚠</span>}
                    </span>
                  </div>
                  <Progress value={c.coverage} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-3">📝 Assessment Activity</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-center">
                <p className="text-2xl font-bold text-foreground">{classesWithAssessments}%</p>
                <p className="text-xs text-muted-foreground">Classes with Regular Assessments</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-center">
                <p className="text-2xl font-bold text-foreground">{100 - classesWithAssessments}%</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  Missing Assessments <span className="text-amber-500">⚠</span>
                </p>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowCompliance(true)}>
            <Eye className="w-3.5 h-3.5" /> View Compliance Details
          </Button>
        </CardContent>
      </Card>

      {/* Subject & Class Performance Map */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-lg">Subject & Class Performance Map</CardTitle>
              <CardDescription>Performance breakdown by subject and class</CardDescription>
            </div>
            <SectionFilters classFilter={classFilter} onClassChange={setClassFilter} weekFilter={perfTimeFilter} onWeekChange={setPerfTimeFilter} termFilter={perfTermFilter} onTermChange={setPerfTermFilter} yearFilter={perfYearFilter} onYearChange={setPerfYearFilter} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subjectPerformance.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <span>{s.status === 'good' ? '🟢' : '🟡'}</span>
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{s.score}%</span>
                  {s.status === 'warning' && <span className="text-amber-500 text-xs">⚠</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground mb-2">👉 Classes Needing Support</p>
            <div className="flex flex-wrap gap-2">
              {classesNeedingSupport.map((c, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{c.class} {c.subject}</Badge>
              ))}
            </div>
            
          </div>
        </CardContent>
      </Card>

      {/* Student Engagement & Risk Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg">Student Engagement & Risk Alerts</CardTitle>
              <CardDescription>Self learning and risk identification</CardDescription>
            </div>
            <SectionFilters classFilter={classFilter} onClassChange={setClassFilter} weekFilter={engWeekFilter} onWeekChange={setEngWeekFilter} termFilter={engTermFilter} onTermChange={setEngTermFilter} yearFilter={engYearFilter} onYearChange={setEngYearFilter} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-3">👥 Self Learning</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-center">
                <p className="text-2xl font-bold text-foreground">{activeLearnersCount}<span className="text-sm font-normal text-muted-foreground">/{totalStudents}</span></p>
                <p className="text-xs text-muted-foreground">Active Learners</p>
              </div>
              <div className="p-3 rounded-xl bg-destructive/10 text-center">
                <p className="text-2xl font-bold text-foreground">{atRiskCount}<span className="text-sm font-normal text-muted-foreground">/{totalStudents}</span></p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">At Risk Learners <span className="text-destructive">⚠</span></p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-center">
                <p className="text-2xl font-bold text-foreground">{inactiveLearners}<span className="text-sm font-normal text-muted-foreground">/{totalStudents}</span></p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">Inactive Learners <span className="text-amber-500">🚨</span></p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">⚠ Students at Academic Risk: {atRiskCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                👉 Jesi AI Insight: "Low engagement strongly correlates with declining performance."
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowAtRisk(true)}>
            <Eye className="w-3.5 h-3.5" /> View At-Risk Students
          </Button>
        </CardContent>
      </Card>


      {/* At-Risk Students Dialog */}
      <Dialog open={showAtRisk} onOpenChange={setShowAtRisk}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>At-Risk Students</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mb-3">Learners scoring below 40% average</p>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {atRiskStudentsMock.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-xs font-bold text-destructive">
                    {s.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.class} • {s.subject} • Avg: {s.avgScore}%</p>
                  </div>
                </div>
                <Badge variant="destructive" className="text-xs">At Risk</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Teacher Insights Dialog */}
      <Dialog open={showTeacherInsights} onOpenChange={setShowTeacherInsights}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detailed Teacher Insights</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Top Performing - Detailed */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1">⭐ Top Performing Teachers</p>
              {topTeachers.map((t, i) => (
                <div key={i} className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 mb-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm font-bold text-emerald-600">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{(t.subjects || []).join(', ') || 'N/A'} • {t.classGrade || 'N/A'}</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto text-xs bg-emerald-500/10 text-emerald-700">{t.note}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 rounded-lg bg-background text-center">
                      <p className="text-lg font-bold text-foreground">{12 + i * 3}</p>
                      <p className="text-[10px] text-muted-foreground">Lesson Plans</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background text-center">
                      <p className="text-lg font-bold text-foreground">{8 + i * 2}</p>
                      <p className="text-[10px] text-muted-foreground">Tests Created</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background text-center">
                      <p className="text-lg font-bold text-foreground">{78 + i * 5}%</p>
                      <p className="text-[10px] text-muted-foreground">Avg Student Score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Needing Support - Detailed */}
            <div>
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1">⚠ Teachers Needing Support</p>
              {needSupportTeachers.map((t, i) => (
                <div key={i} className="p-4 rounded-lg bg-destructive/5 border border-destructive/10 mb-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-sm font-bold text-destructive">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{(t.subjects || []).join(', ') || 'N/A'} • {t.classGrade || 'N/A'}</p>
                    </div>
                    <Badge variant="destructive" className="ml-auto text-xs">{t.note}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-2 rounded-lg bg-background text-center">
                      <p className="text-lg font-bold text-foreground">2</p>
                      <p className="text-[10px] text-muted-foreground">Lesson Plans</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background text-center">
                      <p className="text-lg font-bold text-foreground">1</p>
                      <p className="text-[10px] text-muted-foreground">Tests Created</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background text-center">
                      <p className="text-lg font-bold text-foreground">52%</p>
                      <p className="text-[10px] text-muted-foreground">Avg Student Score</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 p-2 rounded bg-muted/30">
                    💡 Recommendation: Schedule a check-in and provide lesson planning resources.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Class Breakdown Dialog */}
      <Dialog open={showClassBreakdown} onOpenChange={setShowClassBreakdown}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Class Performance Breakdown</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {classesNeedingSupport.map((c, i) => (
              <div key={i} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <p className="text-sm font-medium text-foreground">{c.class} — {c.subject}</p>
                <p className="text-xs text-muted-foreground mt-1">Below target performance. Consider additional support.</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Compliance Dialog */}
      <Dialog open={showCompliance} onOpenChange={setShowCompliance}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Curriculum Compliance Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {curriculumCoverage.map((c) => (
              <div key={c.subject} className="p-3 rounded-lg bg-muted/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-foreground">{c.subject}</span>
                  <span className="text-sm text-muted-foreground">{c.coverage}%</span>
                </div>
                <Progress value={c.coverage} className="h-2" />
                {c.coverage < 70 && (
                  <p className="text-xs text-amber-600">⚠ Behind schedule — review lesson plans</p>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInsights;
