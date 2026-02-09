import React, { useEffect, useState } from 'react';
import { useAdmin } from '../SchoolAdminApp';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard: React.FC = () => {
  const { institution } = useAdmin();
  const [memberCounts, setMemberCounts] = useState({ teachers: 0, students: 0, admins: 0 });

  useEffect(() => {
    if (!institution) return;
    const fetchCounts = async () => {
      const { data } = await supabase
        .from('institution_members' as any)
        .select('member_role')
        .eq('institution_id', institution.id)
        .eq('is_active', true);

      if (data) {
        const members = data as any[];
        setMemberCounts({
          teachers: members.filter(m => m.member_role === 'teacher').length,
          students: members.filter(m => m.member_role === 'student').length,
          admins: members.filter(m => m.member_role === 'admin').length,
        });
      }
    };
    fetchCounts();
  }, [institution]);

  const planLabel = institution?.selected_plan === 'premium_institution' ? 'Premium Institution' : 'Pro Institution';
  const totalMembers = memberCounts.teachers + memberCounts.students + memberCounts.admins;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to {institution?.name || 'your institution'} admin portal
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{memberCounts.teachers}</p>
                <p className="text-sm text-muted-foreground">
                  Teachers ({institution?.total_teacher_slots || 0} slots)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{memberCounts.students}</p>
                <p className="text-sm text-muted-foreground">
                  Students ({institution?.total_student_slots || 0} slots)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{planLabel}</p>
                <p className="text-sm text-muted-foreground">Current Plan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Institution Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Institution Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name</p>
              <p className="font-medium text-foreground">{institution?.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">City</p>
              <p className="font-medium text-foreground">{institution?.city || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Region</p>
              <p className="font-medium text-foreground">{institution?.region || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{institution?.phone || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{institution?.email || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Address</p>
              <p className="font-medium text-foreground">{institution?.address || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
