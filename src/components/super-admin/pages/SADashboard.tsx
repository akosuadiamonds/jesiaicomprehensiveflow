import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { School, Users, GraduationCap, BookOpen, CreditCard, TrendingUp, UserCheck, Activity, CalendarDays, DollarSign, UserMinus, Globe } from 'lucide-react';
import { useSuperAdmin } from '../SuperAdminApp';
import { Separator } from '@/components/ui/separator';

const SADashboard: React.FC = () => {
  const { setCurrentPage } = useSuperAdmin();
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalPlans: 0,
    activeSubscriptions: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    churnRate: 0,
    reach: 0,
  });

  const [userMetrics, setUserMetrics] = useState({
    registeredStudents: 0,
    activatedStudents: 0,
    malStudents: 0,
    walStudents: 0,
    registeredTeachers: 0,
    activatedTeachers: 0,
    matTeachers: 0,
    watTeachers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [schools, teachers, students, plans, subs, transactions, allProfiles] = await Promise.all([
        supabase.from('institutions').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_role', 'teacher'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_role', 'learner'),
        supabase.from('subscription_plans').select('id', { count: 'exact', head: true }),
        supabase.from('school_subscriptions').select('id, status, payment_status'),
        supabase.from('payment_transactions').select('amount, status'),
        supabase.from('profiles').select('id, user_role, selected_plan, created_at'),
      ]);

      const subData = subs.data || [];
      const txData = transactions.data || [];
      const profileData = allProfiles.data || [];

      // Total revenue from completed transactions
      const totalRevenue = txData
        .filter((t: any) => t.status === 'completed')
        .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

      // Reach = total unique users across all roles
      const reach = profileData.length;

      // Churn rate = inactive subs / total subs (percentage)
      const totalSubs = subData.length;
      const inactiveSubs = subData.filter((s: any) => s.status === 'cancelled' || s.status === 'expired').length;
      const churnRate = totalSubs > 0 ? Math.round((inactiveSubs / totalSubs) * 100) : 0;

      setStats({
        totalSchools: schools.count || 0,
        totalTeachers: teachers.count || 0,
        totalStudents: students.count || 0,
        totalPlans: plans.count || 0,
        activeSubscriptions: subData.filter((s: any) => s.status === 'active').length,
        pendingPayments: subData.filter((s: any) => s.payment_status === 'unpaid').length,
        totalRevenue,
        churnRate,
        reach,
      });
    };

    const fetchUserMetrics = async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch all profiles for metric calculations
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('user_id, user_role, selected_plan, updated_at, created_at');

      const profiles = allProfiles || [];
      const studentProfiles = profiles.filter(p => p.user_role === 'learner');
      const teacherProfiles = profiles.filter(p => p.user_role === 'teacher');

      // Activated = has a selected_plan that is not null/free
      const activatedStudents = studentProfiles.filter(p => p.selected_plan && p.selected_plan !== 'free').length;
      const activatedTeachers = teacherProfiles.filter(p => p.selected_plan && p.selected_plan !== 'free').length;

      // Monthly active = updated_at within last 30 days (proxy for activity)
      const malStudents = studentProfiles.filter(p => p.updated_at >= thirtyDaysAgo).length;
      const matTeachers = teacherProfiles.filter(p => p.updated_at >= thirtyDaysAgo).length;

      // Weekly active = updated_at within last 7 days
      const walStudents = studentProfiles.filter(p => p.updated_at >= sevenDaysAgo).length;
      const watTeachers = teacherProfiles.filter(p => p.updated_at >= sevenDaysAgo).length;

      setUserMetrics({
        registeredStudents: studentProfiles.length,
        activatedStudents,
        malStudents,
        walStudents,
        registeredTeachers: teacherProfiles.length,
        activatedTeachers,
        matTeachers,
        watTeachers,
      });
    };

    fetchStats();
    fetchUserMetrics();
  }, []);

  const overviewCards = [
    { label: 'Schools', value: stats.totalSchools, icon: School, color: 'text-blue-500', page: 'schools' },
    { label: 'Teachers', value: stats.totalTeachers, icon: GraduationCap, color: 'text-green-500', page: 'users' },
    { label: 'Students', value: stats.totalStudents, icon: BookOpen, color: 'text-purple-500', page: 'users' },
    { label: 'Plans', value: stats.totalPlans, icon: CreditCard, color: 'text-orange-500', page: 'plans' },
    { label: 'Active Subs', value: stats.activeSubscriptions, icon: TrendingUp, color: 'text-emerald-500', page: 'subscriptions' },
    { label: 'Total Revenue', value: `GHS ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', page: 'financials' },
    { label: 'Churn Rate', value: `${stats.churnRate}%`, icon: UserMinus, color: 'text-red-500', page: 'subscriptions' },
    { label: 'Reach (All Users)', value: stats.reach, icon: Globe, color: 'text-sky-500', page: 'users' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: CreditCard, color: 'text-red-500', page: 'subscriptions' },
  ];

  const studentMetricCards = [
    { label: 'Registered Users', value: userMetrics.registeredStudents, icon: Users, color: 'text-purple-500', desc: 'Total signed-up students' },
    { label: 'Activated Learners', value: userMetrics.activatedStudents, icon: UserCheck, color: 'text-indigo-500', desc: 'Students with an active plan' },
    { label: 'Monthly Active (MAL)', value: userMetrics.malStudents, icon: CalendarDays, color: 'text-teal-500', desc: 'Active in last 30 days' },
    { label: 'Weekly Active (WAL)', value: userMetrics.walStudents, icon: Activity, color: 'text-cyan-500', desc: 'Active in last 7 days' },
  ];

  const teacherMetricCards = [
    { label: 'Registered Teachers', value: userMetrics.registeredTeachers, icon: Users, color: 'text-green-500', desc: 'Total signed-up teachers' },
    { label: 'Activated Teachers', value: userMetrics.activatedTeachers, icon: UserCheck, color: 'text-emerald-500', desc: 'Teachers with an active plan' },
    { label: 'Monthly Active (MAT)', value: userMetrics.matTeachers, icon: CalendarDays, color: 'text-lime-500', desc: 'Active in last 30 days' },
    { label: 'Weekly Active (WAT)', value: userMetrics.watTeachers, icon: Activity, color: 'text-green-600', desc: 'Active in last 7 days' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview at a glance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {overviewCards.map((card) => (
          <Card
            key={card.label}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setCurrentPage(card.page)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Student Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-500" /> Student Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {studentMetricCards.map((card) => (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Teacher Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-green-500" /> Teacher Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teacherMetricCards.map((card) => (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SADashboard;
