import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, Clock, BookOpen, FileText, Star, Search } from 'lucide-react';

const TeacherAnalytics: React.FC = () => {
  const [usageFilter, setUsageFilter] = useState('all');
  const [efficiencyFilter, setEfficiencyFilter] = useState('all');
  const [engagementFilter, setEngagementFilter] = useState('all');
  const [impactFilter, setImpactFilter] = useState('all');
  const [gainsSubject, setGainsSubject] = useState('all');
  const [satisfactionFilter, setSatisfactionFilter] = useState('all');
  const [usageSearch, setUsageSearch] = useState('');
  const [efficiencySearch, setEfficiencySearch] = useState('');
  const [engagementSearch, setEngagementSearch] = useState('');

  const [stats, setStats] = useState({
    registered: 0, active: 0, mat: 0, wat: 0,
    lessonCount: 0, quizCount: 0,
  });

  useEffect(() => {
    const load = async () => {
      const [profiles, lessons, quizzes] = await Promise.all([
        supabase.from('profiles').select('user_role, created_at, updated_at'),
        supabase.from('saved_lesson_plans').select('id', { count: 'exact', head: true }),
        supabase.from('saved_quizzes').select('id', { count: 'exact', head: true }),
      ]);
      const teachers = (profiles.data || []).filter((u: any) => u.user_role === 'teacher');
      const now = new Date();
      const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30);
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      setStats({
        registered: teachers.length,
        active: teachers.filter((t: any) => new Date(t.updated_at) > monthAgo).length,
        mat: teachers.filter((t: any) => new Date(t.updated_at) > monthAgo).length,
        wat: teachers.filter((t: any) => new Date(t.updated_at) > weekAgo).length,
        lessonCount: lessons.count || 0,
        quizCount: quizzes.count || 0,
      });
    };
    load();
  }, []);

  const learningGainsData = [
    { subject: 'Math', progress: 72 }, { subject: 'English', progress: 68 },
    { subject: 'Science', progress: 81 }, { subject: 'Social Studies', progress: 64 },
    { subject: 'ICT', progress: 75 },
  ];

  const filterSelect = (value: string, onChange: (v: string) => void, options: { value: string; label: string }[]) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  const regionFilters = [
    { value: 'all', label: 'All' }, { value: 'school', label: 'School' },
    { value: 'district', label: 'District' }, { value: 'region', label: 'Region' },
  ];

  return (
    <div className="space-y-6">
      {/* Teacher Usage & Adoption */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-foreground">Teacher Usage & Adoption</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={usageSearch} onChange={e => setUsageSearch(e.target.value)} className="pl-8 w-[180px]" />
            </div>
            {filterSelect(usageFilter, setUsageFilter, regionFilters)}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Registered Teachers</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.registered}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Teachers</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.active}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Monthly Active (MAT)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.mat}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Weekly Active (WAT)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.wat}</div></CardContent></Card>
        </div>
      </div>

      {/* Teacher Efficiency */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-foreground">Teacher Efficiency</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={efficiencySearch} onChange={e => setEfficiencySearch(e.target.value)} className="pl-8 w-[180px]" />
            </div>
            {filterSelect(efficiencyFilter, setEfficiencyFilter, regionFilters)}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><CardTitle className="text-sm font-medium text-muted-foreground">Hours Saved</CardTitle></div></CardHeader>
            <CardContent><div className="text-2xl font-bold">{(stats.lessonCount * 2 + stats.quizCount).toLocaleString()}</div><p className="text-xs text-muted-foreground">Estimated from content created</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /><CardTitle className="text-sm font-medium text-muted-foreground">Lessons Created</CardTitle></div></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.lessonCount}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /><CardTitle className="text-sm font-medium text-muted-foreground">Assignments Created</CardTitle></div></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.quizCount}</div></CardContent></Card>
        </div>
      </div>

      {/* Learner Engagement */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-foreground">Learner Engagement</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={engagementSearch} onChange={e => setEngagementSearch(e.target.value)} className="pl-8 w-[180px]" />
            </div>
            {filterSelect(engagementFilter, setEngagementFilter, [
              { value: 'all', label: 'All' }, { value: 'school', label: 'School' },
              { value: 'class', label: 'Class' }, { value: 'subject', label: 'Subject' },
              { value: 'week', label: 'Week' },
            ])}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Engagement Score</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">76%</div><Progress value={76} className="h-2 mt-2" /></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Assignments Completed</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">328</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Self Learning Sessions</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">152</div></CardContent></Card>
        </div>
      </div>

      {/* Learner Impact */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-foreground">Learner Impact</h3>
          {filterSelect(impactFilter, setImpactFilter, [
            { value: 'all', label: 'All' }, { value: 'school', label: 'School' },
            { value: 'class', label: 'Class' }, { value: 'month', label: 'Month' },
            { value: 'subject', label: 'Subject' },
          ])}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">72%</div><Progress value={72} className="h-2 mt-2" /></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Learning Gain</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-primary">+14%</div><p className="text-xs text-muted-foreground">Improvement over baseline</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">At-Risk Learners</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive">18</div><p className="text-xs text-muted-foreground">Per selected school</p></CardContent></Card>
        </div>
      </div>

      {/* Learning Gains */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-foreground">Learning Gains</h3>
          {filterSelect(gainsSubject, setGainsSubject, [
            { value: 'all', label: 'All Subjects' }, { value: 'math', label: 'Math' },
            { value: 'english', label: 'English' }, { value: 'science', label: 'Science' },
          ])}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-sm font-medium">Learning Progress per Subject (out of 100)</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ progress: { label: 'Progress', color: 'hsl(var(--primary))' } }} className="h-[250px] w-full">
                <BarChart data={learningGainsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Score Improvement</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-primary">+12%</div></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Students Improving ≥ 10%</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">64%</div><Progress value={64} className="h-2 mt-2" /></CardContent></Card>
          </div>
        </div>
      </div>

      {/* Teacher Satisfaction */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Teacher Satisfaction</h3>
          </div>
          {filterSelect(satisfactionFilter, setSatisfactionFilter, [
            { value: 'all', label: 'All' }, { value: 'region', label: 'Region' },
            { value: 'district', label: 'District' }, { value: 'school', label: 'School' },
          ])}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">4.5 <span className="text-lg text-muted-foreground">/ 5</span></div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Net Promoter Score</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-primary">+42</div><p className="text-xs text-muted-foreground">Good — above industry average</p></CardContent></Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalytics;
