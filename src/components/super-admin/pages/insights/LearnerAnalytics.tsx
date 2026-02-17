import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Brain, Target, AlertTriangle, TrendingUp } from 'lucide-react';
import AnalyticsFilters, { FilterType } from './AnalyticsFilters';

const LearnerAnalytics: React.FC = () => {
  const [engagementFilters, setEngagementFilters] = useState<Record<string, string>>({});
  const [engagementSearch, setEngagementSearch] = useState('');
  const [outcomesFilters, setOutcomesFilters] = useState<Record<string, string>>({});

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

  const engagementFilterTypes: FilterType[] = ['school', 'district', 'region'];
  const outcomesFilterTypes: FilterType[] = ['region', 'district', 'school', 'academic_year', 'class'];

  return (
    <div className="space-y-6">
      {/* Learning Engagement */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-foreground">Learning Engagement</h3>
          <AnalyticsFilters
            filters={engagementFilterTypes}
            values={engagementFilters}
            onChange={(t, v) => setEngagementFilters(p => ({ ...p, [t]: v }))}
            showSearch
            searchValue={engagementSearch}
            onSearchChange={setEngagementSearch}
          />
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
          <AnalyticsFilters
            filters={outcomesFilterTypes}
            values={outcomesFilters}
            onChange={(t, v) => setOutcomesFilters(p => ({ ...p, [t]: v }))}
          />
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
