import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { School, Users, GraduationCap, BookOpen, CreditCard, TrendingUp } from 'lucide-react';
import { useSuperAdmin } from '../SuperAdminApp';

const SADashboard: React.FC = () => {
  const { setCurrentPage } = useSuperAdmin();
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalPlans: 0,
    activeSubscriptions: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [schools, teachers, students, plans, subs] = await Promise.all([
        supabase.from('institutions').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_role', 'teacher'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_role', 'learner'),
        supabase.from('subscription_plans').select('id', { count: 'exact', head: true }),
        supabase.from('school_subscriptions').select('id, status, payment_status'),
      ]);

      const subData = subs.data || [];
      setStats({
        totalSchools: schools.count || 0,
        totalTeachers: teachers.count || 0,
        totalStudents: students.count || 0,
        totalPlans: plans.count || 0,
        activeSubscriptions: subData.filter((s: any) => s.status === 'active').length,
        pendingPayments: subData.filter((s: any) => s.payment_status === 'unpaid').length,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Schools', value: stats.totalSchools, icon: School, color: 'text-blue-500', page: 'schools' },
    { label: 'Teachers', value: stats.totalTeachers, icon: GraduationCap, color: 'text-green-500', page: 'users' },
    { label: 'Students', value: stats.totalStudents, icon: BookOpen, color: 'text-purple-500', page: 'users' },
    { label: 'Plans', value: stats.totalPlans, icon: CreditCard, color: 'text-orange-500', page: 'plans' },
    { label: 'Active Subs', value: stats.activeSubscriptions, icon: TrendingUp, color: 'text-emerald-500', page: 'subscriptions' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: CreditCard, color: 'text-red-500', page: 'subscriptions' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
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
    </div>
  );
};

export default SADashboard;
