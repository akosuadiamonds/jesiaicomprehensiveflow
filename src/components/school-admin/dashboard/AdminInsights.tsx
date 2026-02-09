import React, { useEffect, useState } from 'react';
import { useAdmin } from '../SchoolAdminApp';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, TrendingUp, Activity, BookOpen, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface InsightData {
  totalMembers: number;
  activeTeachers: number;
  activeStudents: number;
  teacherSlotUsage: number;
  studentSlotUsage: number;
  recentJoins: number;
}

const AdminInsights: React.FC = () => {
  const { institution } = useAdmin();
  const [data, setData] = useState<InsightData>({
    totalMembers: 0,
    activeTeachers: 0,
    activeStudents: 0,
    teacherSlotUsage: 0,
    studentSlotUsage: 0,
    recentJoins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institution) return;
    const fetchInsights = async () => {
      const { data: members } = await supabase
        .from('institution_members')
        .select('member_role, is_active, joined_at')
        .eq('institution_id', institution.id);

      if (members) {
        const memberList = members as any[];
        const activeTeachers = memberList.filter(m => m.member_role === 'teacher' && m.is_active).length;
        const activeStudents = memberList.filter(m => m.member_role === 'student' && m.is_active).length;
        const totalActive = memberList.filter(m => m.is_active).length;

        // Recent joins (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentJoins = memberList.filter(m => new Date(m.joined_at) >= weekAgo).length;

        setData({
          totalMembers: totalActive,
          activeTeachers,
          activeStudents,
          teacherSlotUsage: institution.total_teacher_slots > 0
            ? Math.round((activeTeachers / institution.total_teacher_slots) * 100)
            : 0,
          studentSlotUsage: institution.total_student_slots > 0
            ? Math.round((activeStudents / institution.total_student_slots) * 100)
            : 0,
          recentJoins,
        });
      }
      setLoading(false);
    };
    fetchInsights();
  }, [institution]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Active Users', value: data.totalMembers, icon: Users, color: 'text-primary' },
    { label: 'Active Teachers', value: data.activeTeachers, icon: GraduationCap, color: 'text-accent' },
    { label: 'Active Students', value: data.activeStudents, icon: BookOpen, color: 'text-success' },
    { label: 'New This Week', value: data.recentJoins, icon: TrendingUp, color: 'text-primary' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Insights</h1>
        <p className="text-muted-foreground mt-1">Analytics and usage overview for your institution</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Slot Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="w-5 h-5" />
              Teacher Slot Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {data.activeTeachers} / {institution?.total_teacher_slots || 0} slots used
              </span>
              <span className="font-medium text-foreground">{data.teacherSlotUsage}%</span>
            </div>
            <Progress value={data.teacherSlotUsage} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {(institution?.total_teacher_slots || 0) - data.activeTeachers} slots remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-5 h-5" />
              Student Slot Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {data.activeStudents} / {institution?.total_student_slots || 0} slots used
              </span>
              <span className="font-medium text-foreground">{data.studentSlotUsage}%</span>
            </div>
            <Progress value={data.studentSlotUsage} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {(institution?.total_student_slots || 0) - data.activeStudents} slots remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Institution Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{data.teacherSlotUsage}%</p>
              <p className="text-xs text-muted-foreground">Teacher Capacity</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-foreground">{data.studentSlotUsage}%</p>
              <p className="text-xs text-muted-foreground">Student Capacity</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <Users className="w-6 h-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold text-foreground">{data.totalMembers}</p>
              <p className="text-xs text-muted-foreground">Total Members</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{data.recentJoins}</p>
              <p className="text-xs text-muted-foreground">Joined This Week</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInsights;
