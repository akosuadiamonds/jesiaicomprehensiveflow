import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { School, Users, GraduationCap, BookOpen, TrendingUp, Activity } from 'lucide-react';

const SAInsights: React.FC = () => {
  const [data, setData] = useState({
    totalSchools: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalSchoolAdmins: 0,
    totalLessonPlans: 0,
    totalQuizzes: 0,
    totalExams: 0,
    recentUsers: 0,
    planBreakdown: { free: 0, pro: 0, premium: 0 },
  });

  useEffect(() => {
    const fetch = async () => {
      const [schools, profiles, lessons, quizzes, exams] = await Promise.all([
        supabase.from('institutions').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('user_role, selected_plan, created_at'),
        supabase.from('saved_lesson_plans').select('id', { count: 'exact', head: true }),
        supabase.from('saved_quizzes').select('id', { count: 'exact', head: true }),
        supabase.from('saved_exams').select('id', { count: 'exact', head: true }),
      ]);

      const users = profiles.data || [];
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

      setData({
        totalSchools: schools.count || 0,
        totalTeachers: users.filter((u: any) => u.user_role === 'teacher').length,
        totalStudents: users.filter((u: any) => u.user_role === 'learner').length,
        totalSchoolAdmins: users.filter((u: any) => u.user_role === 'school_admin').length,
        totalLessonPlans: lessons.count || 0,
        totalQuizzes: quizzes.count || 0,
        totalExams: exams.count || 0,
        recentUsers: users.filter((u: any) => new Date(u.created_at) > weekAgo).length,
        planBreakdown: {
          free: users.filter((u: any) => !u.selected_plan || u.selected_plan === 'free').length,
          pro: users.filter((u: any) => u.selected_plan === 'pro').length,
          premium: users.filter((u: any) => u.selected_plan === 'premium').length,
        },
      });
    };
    fetch();
  }, []);

  const totalUsers = data.totalTeachers + data.totalStudents + data.totalSchoolAdmins;

  const statCards = [
    { label: 'Total Schools', value: data.totalSchools, icon: School, color: 'text-blue-500' },
    { label: 'Teachers', value: data.totalTeachers, icon: GraduationCap, color: 'text-green-500' },
    { label: 'Students', value: data.totalStudents, icon: BookOpen, color: 'text-purple-500' },
    { label: 'School Admins', value: data.totalSchoolAdmins, icon: Users, color: 'text-orange-500' },
    { label: 'New Users (7d)', value: data.recentUsers, icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Total Content', value: data.totalLessonPlans + data.totalQuizzes + data.totalExams, icon: Activity, color: 'text-pink-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Insights</h1>
        <p className="text-muted-foreground mt-1">Analytics and metrics across the entire platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Card key={card.label}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Teachers', count: data.totalTeachers, color: 'bg-blue-500' },
              { label: 'Students', count: data.totalStudents, color: 'bg-purple-500' },
              { label: 'School Admins', count: data.totalSchoolAdmins, color: 'bg-orange-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">{item.count} ({totalUsers > 0 ? Math.round(item.count / totalUsers * 100) : 0}%)</span>
                </div>
                <Progress value={totalUsers > 0 ? (item.count / totalUsers) * 100 : 0} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Free', count: data.planBreakdown.free, color: 'bg-gray-500' },
              { label: 'Pro', count: data.planBreakdown.pro, color: 'bg-blue-500' },
              { label: 'Premium', count: data.planBreakdown.premium, color: 'bg-purple-500' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
                <Progress value={totalUsers > 0 ? (item.count / totalUsers) * 100 : 0} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Created</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Lesson Plans</span>
              <span className="font-bold">{data.totalLessonPlans}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Quizzes</span>
              <span className="font-bold">{data.totalQuizzes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Exams</span>
              <span className="font-bold">{data.totalExams}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SAInsights;
