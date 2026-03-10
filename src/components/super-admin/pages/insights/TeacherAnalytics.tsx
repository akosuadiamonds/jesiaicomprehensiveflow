import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Clock, BookOpen, FileText, Star } from 'lucide-react';
import AnalyticsFilters, { FilterType } from './AnalyticsFilters';

const TeacherAnalytics: React.FC = () => {
  const [usageFilters, setUsageFilters] = useState<Record<string, string>>({});
  const [usageSearch, setUsageSearch] = useState('');
  const [efficiencyFilters, setEfficiencyFilters] = useState<Record<string, string>>({});
  const [efficiencySearch, setEfficiencySearch] = useState('');
  const [engagementFilters, setEngagementFilters] = useState<Record<string, string>>({});
  const [engagementSearch, setEngagementSearch] = useState('');
  const [impactFilters, setImpactFilters] = useState<Record<string, string>>({});
  const [gainsFilters, setGainsFilters] = useState<Record<string, string>>({});
  const [satisfactionFilters, setSatisfactionFilters] = useState<Record<string, string>>({});

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

  const locationFilters: FilterType[] = ['school', 'district', 'region'];
  const engagementFilterTypes: FilterType[] = ['school', 'class', 'subject', 'week'];
  const impactFilterTypes: FilterType[] = ['school', 'class', 'month', 'subject'];
  const gainsFilterTypes: FilterType[] = ['subject', 'school'];
  const satisfactionFilterTypes: FilterType[] = ['region', 'district', 'school'];

  return (
    <div className="space-y-6">
      {/* Teacher Usage & Adoption */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-foreground">Teacher Usage & Adoption</h3>
          <AnalyticsFilters
            filters={locationFilters}
            values={usageFilters}
            onChange={(t, v) => setUsageFilters(p => ({ ...p, [t]: v }))}
            showSearch
            searchValue={usageSearch}
            onSearchChange={setUsageSearch}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Registered Teachers</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.registered}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Active Teachers</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.active}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Monthly Active Teachers (MAT)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.mat}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Weekly Active Teachers (WAT)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.wat}</div></CardContent></Card>
        </div>
      </div>

      {/* Teacher Efficiency */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-foreground">Teacher Efficiency</h3>
          <AnalyticsFilters
            filters={locationFilters}
            values={efficiencyFilters}
            onChange={(t, v) => setEfficiencyFilters(p => ({ ...p, [t]: v }))}
            showSearch
            searchValue={efficiencySearch}
            onSearchChange={setEfficiencySearch}
          />
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
          <AnalyticsFilters
            filters={engagementFilterTypes}
            values={engagementFilters}
            onChange={(t, v) => setEngagementFilters(p => ({ ...p, [t]: v }))}
            showSearch
            searchValue={engagementSearch}
            onSearchChange={setEngagementSearch}
          />
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
          <AnalyticsFilters
            filters={impactFilterTypes}
            values={impactFilters}
            onChange={(t, v) => setImpactFilters(p => ({ ...p, [t]: v }))}
          />
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


      {/* Teacher Satisfaction */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Teacher Satisfaction</h3>
          </div>
          <AnalyticsFilters
            filters={satisfactionFilterTypes}
            values={satisfactionFilters}
            onChange={(t, v) => setSatisfactionFilters(p => ({ ...p, [t]: v }))}
          />
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
