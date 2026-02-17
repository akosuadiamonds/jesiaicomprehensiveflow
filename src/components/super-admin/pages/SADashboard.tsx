import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, GraduationCap, BookOpen, School, DollarSign, 
  TrendingUp, UserMinus, CreditCard, Clock, AlertTriangle, 
  Globe, BarChart3, Eye, Building
} from 'lucide-react';
import { useSuperAdmin } from '../SuperAdminApp';
import { Separator } from '@/components/ui/separator';

const SADashboard: React.FC = () => {
  const { setCurrentPage } = useSuperAdmin();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTeachers: 0,
    activeStudents: 0,
    totalSchools: 0,
    totalRevenue: 0,
    activeTeacherSubs: 0,
    activeLearnerSubs: 0,
    activeSchoolSubs: 0,
    arpu: 0,
    churnRate: 0,
    hoursSaved: 0,
    atRiskLearners: 0,
    geographicReach: 0,
  });

  const [recentActivity, setRecentActivity] = useState<Array<{ title: string; time: string; type: string }>>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const [
        allProfiles,
        institutions,
        subs,
        transactions,
        lessonPlans,
        practiceSessions,
      ] = await Promise.all([
        supabase.from('profiles').select('id, user_role, selected_plan, updated_at, created_at, school_name'),
        supabase.from('institutions').select('id', { count: 'exact', head: true }),
        supabase.from('school_subscriptions').select('id, status, payment_status, total_amount, plan_id'),
        supabase.from('payment_transactions').select('amount, status, created_at'),
        supabase.from('saved_lesson_plans').select('id, created_at'),
        supabase.from('practice_sessions').select('id, student_id, correct_answers, total_questions'),
      ]);

      const profiles = allProfiles.data || [];
      const subData = subs.data || [];
      const txData = transactions.data || [];
      const lessons = lessonPlans.data || [];
      const practices = practiceSessions.data || [];

      const totalUsers = profiles.length;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const teachers = profiles.filter(p => p.user_role === 'teacher');
      const students = profiles.filter(p => p.user_role === 'learner');
      const activeTeachers = teachers.filter(p => p.updated_at >= thirtyDaysAgo).length;
      const activeStudents = students.filter(p => p.updated_at >= thirtyDaysAgo).length;

      // Revenue
      const totalRevenue = txData
        .filter((t: any) => t.status === 'completed')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      // Active subscriptions by type
      const activeSubs = subData.filter((s: any) => s.status === 'active');
      // Approximate: teacher subs = teachers with pro/premium plan, learner subs = learners with plan, school subs = active school_subscriptions
      const activeTeacherSubs = teachers.filter(p => p.selected_plan && p.selected_plan !== 'free').length;
      const activeLearnerSubs = students.filter(p => p.selected_plan && p.selected_plan !== 'free').length;
      const activeSchoolSubs = activeSubs.length;

      // ARPU
      const totalActiveSubs = activeTeacherSubs + activeLearnerSubs + activeSchoolSubs;
      const arpu = totalActiveSubs > 0 ? Math.round(totalRevenue / totalActiveSubs) : 0;

      // Churn
      const totalSubs = subData.length;
      const inactiveSubs = subData.filter((s: any) => s.status === 'cancelled' || s.status === 'expired').length;
      const churnRate = totalSubs > 0 ? Math.round((inactiveSubs / totalSubs) * 100) : 0;

      // Hours saved (estimate: 2 hours per lesson plan)
      const hoursSaved = lessons.length * 2;

      // At-risk learners (score < 50%)
      const studentScores = new Map<string, { correct: number; total: number }>();
      practices.forEach((p: any) => {
        const existing = studentScores.get(p.student_id) || { correct: 0, total: 0 };
        existing.correct += p.correct_answers || 0;
        existing.total += p.total_questions || 0;
        studentScores.set(p.student_id, existing);
      });
      let atRiskLearners = 0;
      studentScores.forEach((scores) => {
        if (scores.total > 0 && (scores.correct / scores.total) < 0.5) atRiskLearners++;
      });

      // Geographic reach (unique school names)
      const uniqueSchools = new Set(profiles.map(p => p.school_name).filter(Boolean));
      const geographicReach = uniqueSchools.size;

      setStats({
        totalUsers,
        activeTeachers,
        activeStudents,
        totalSchools: institutions.count || 0,
        totalRevenue,
        activeTeacherSubs,
        activeLearnerSubs,
        activeSchoolSubs,
        arpu,
        churnRate,
        hoursSaved,
        atRiskLearners,
        geographicReach,
      });

      // Recent activity from transactions
      const recentTx = txData
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((t: any) => ({
          title: `Payment of GHS ${(t.amount || 0).toFixed(2)} - ${t.status}`,
          time: new Date(t.created_at).toLocaleDateString(),
          type: 'payment',
        }));

      setRecentActivity(recentTx.length > 0 ? recentTx : [
        { title: 'Platform launched', time: 'Recently', type: 'system' },
        { title: 'Awaiting first transactions', time: '', type: 'system' },
      ]);
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    { icon: Building, label: 'Onboard School', onClick: () => setCurrentPage('schools') },
    { icon: Users, label: 'View Users', onClick: () => setCurrentPage('users') },
    { icon: CreditCard, label: 'View Subscriptions', onClick: () => setCurrentPage('subscriptions') },
    { icon: BarChart3, label: 'View Analytics', onClick: () => setCurrentPage('insights') },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview at a glance</p>
      </div>

      {/* Platform Adoption & Growth */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Platform Adoption & Growth
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">All registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Teachers</CardTitle>
              <GraduationCap className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.activeTeachers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Active in last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Students</CardTitle>
              <BookOpen className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.activeStudents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Active in last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Schools</CardTitle>
              <School className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalSchools.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered institutions</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Business & Financial Health */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" /> Business & Financial Health
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentPage('financials')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">GHS {stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentPage('subscriptions')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
              <CreditCard className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground mb-2">
                {stats.activeTeacherSubs + stats.activeLearnerSubs + stats.activeSchoolSubs}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Teachers</span><span className="font-medium text-foreground">{stats.activeTeacherSubs}</span></div>
                <div className="flex justify-between"><span>Learners</span><span className="font-medium text-foreground">{stats.activeLearnerSubs}</span></div>
                <div className="flex justify-between"><span>Schools</span><span className="font-medium text-foreground">{stats.activeSchoolSubs}</span></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ARPU</CardTitle>
              <TrendingUp className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">GHS {stats.arpu.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Avg revenue per user</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
              <UserMinus className="w-5 h-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.churnRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Inactive vs total subscriptions</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Impact & Social Value */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" /> Impact & Social Value
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Teachers Hours Saved</CardTitle>
              <Clock className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.hoursSaved.toLocaleString()}h</div>
              <p className="text-xs text-muted-foreground mt-1">Estimated from lesson plans created</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">At-Risk Learners</CardTitle>
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.atRiskLearners}</div>
              <p className="text-xs text-muted-foreground mt-1">Scoring below 50%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Geographic Reach</CardTitle>
              <Globe className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.geographicReach}</div>
              <p className="text-xs text-muted-foreground mt-1">Unique schools represented</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="p-5 rounded-2xl bg-card border border-border hover:shadow-md transition-all duration-200 text-left group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <action.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-foreground text-sm">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <Separator />

      {/* Recent Activity */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    {activity.time && <p className="text-xs text-muted-foreground">{activity.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default SADashboard;
