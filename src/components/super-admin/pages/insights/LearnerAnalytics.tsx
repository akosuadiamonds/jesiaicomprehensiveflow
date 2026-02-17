import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, Brain, Target, Search, AlertTriangle, TrendingUp } from 'lucide-react';

const LearnerAnalytics: React.FC = () => {
  const [engagementFilter, setEngagementFilter] = useState('all');
  const [engagementSearch, setEngagementSearch] = useState('');
  const [outcomesFilter, setOutcomesFilter] = useState('all');

  const [stats, setStats] = useState({ totalLearners: 0, mal: 0, wal: 0, totalSessions: 0 });

  useEffect(() => {
    const load = async () => {
      const [profiles, sessions] = await Promise.all([
        supabase.from('profiles').select('user_role, updated_at'),
        supabase.from('practice_sessions').select('id', { count: 'exact', head: true }),
      ]);
      const learners = (profiles.data || []).filter((u: any) => u.user_role === 'learner');
      const now = new Date();
      const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30);
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      setStats({
        totalLearners: learners.length,
        mal: learners.filter((l: any) => new Date(l.updated_at) > monthAgo).length,
        wal: learners.filter((l: any) => new Date(l.updated_at) > weekAgo).length,
        totalSessions: sessions.count || 0,
      });
    };
    load();
  }, []);

  const performanceData = [
    { subject: 'Math', score: 74 }, { subject: 'English', score: 69 },
    { subject: 'Science', score: 82 }, { subject: 'Social Studies', score: 65 },
    { subject: 'ICT', score: 78 },
  ];

  const regionFilters = [
    { value: 'all', label: 'All' }, { value: 'school', label: 'School' },
    { value: 'district', label: 'District' }, { value: 'region', label: 'Region' },
  ];

  const filterSelect = (value: string, onChange: (v: string) => void, options: { value: string; label: string }[]) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      {/* Learning Engagement */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-foreground">Learning Engagement</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={engagementSearch} onChange={e => setEngagementSearch(e.target.value)} className="pl-8 w-[180px]" />
            </div>
            {filterSelect(engagementFilter, setEngagementFilter, regionFilters)}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Session (mins)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">24</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions (hrs)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{Math.round(stats.totalSessions * 0.4)}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Monthly Active (MAL)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.mal}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Weekly Active (WAL)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.wal}</div></CardContent></Card>
        </div>
      </div>

      {/* Self-Learning Behaviour */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Self-Learning Behaviour</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><div className="flex items-center gap-2"><Brain className="w-4 h-4 text-primary" /><CardTitle className="text-sm font-medium text-muted-foreground">Self-Initiated Rate</CardTitle></div></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42%</div>
              <p className="text-xs text-muted-foreground">(self-initiated / total) × 100</p>
              <Progress value={42} className="h-2 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Independent Learners</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38%</div>
              <Progress value={38} className="h-2 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Independent Session</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">18 <span className="text-sm text-muted-foreground">mins</span></div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Learning Streaks</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">4.2 <span className="text-sm text-muted-foreground">days</span></div></CardContent>
          </Card>
        </div>
      </div>

      {/* Learning Outcomes Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Learning Outcomes Metrics</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {filterSelect(outcomesFilter, setOutcomesFilter, [
              ...regionFilters,
              { value: 'year', label: 'Academic Year' },
              { value: 'class', label: 'Class (1-9)' },
            ])}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-sm font-medium">Average Performance per Subject</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ score: { label: 'Avg Score', color: 'hsl(var(--primary))' } }} className="h-[250px] w-full">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" /><CardTitle className="text-sm font-medium text-muted-foreground">Learners At Risk</CardTitle></div></CardHeader>
              <CardContent><div className="text-2xl font-bold text-destructive">24</div><p className="text-xs text-muted-foreground">Below 40% average</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /><CardTitle className="text-sm font-medium text-muted-foreground">Learners Improved</CardTitle></div></CardHeader>
              <CardContent><div className="text-2xl font-bold text-primary">156</div><p className="text-xs text-muted-foreground">Score improved ≥ 10%</p></CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerAnalytics;
