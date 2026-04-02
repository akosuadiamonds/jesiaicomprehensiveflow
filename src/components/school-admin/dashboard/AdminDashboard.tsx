import React, { useEffect, useState } from 'react';
import { useAdmin } from '../SchoolAdminApp';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Users, GraduationCap, BookOpen, TrendingUp, Crown, Calendar, ArrowUpRight, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const AdminDashboard: React.FC = () => {
  const { institution } = useAdmin();
  const { profile } = useAuth();
  const [memberCounts, setMemberCounts] = useState({ teachers: 0, students: 0, admins: 0 });
  const [subscription, setSubscription] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!institution) return;
    const fetchData = async () => {
      const [membersRes, subRes] = await Promise.all([
        supabase
          .from('institution_members')
          .select('member_role')
          .eq('institution_id', institution.id)
          .eq('is_active', true),
        supabase
          .from('school_subscriptions')
          .select('*, subscription_plans(name, price, currency, billing_period, features, token_allocation)')
          .eq('institution_id', institution.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
      ]);

      if (membersRes.data) {
        const members = membersRes.data as any[];
        setMemberCounts({
          teachers: members.filter(m => m.member_role === 'teacher').length,
          students: members.filter(m => m.member_role === 'student').length,
          admins: members.filter(m => m.member_role === 'admin').length,
        });
      }

      if (subRes.data) {
        setSubscription(subRes.data);
      }
    };
    fetchData();
  }, [institution]);

  const planLabel = institution?.selected_plan === 'premium_institution' ? 'Premium Institution' : 'Pro Institution';
  const isPremium = institution?.selected_plan === 'premium_institution';
  const totalMembers = memberCounts.teachers + memberCounts.students + memberCounts.admins;

  const dueDate = subscription?.expires_at ? new Date(subscription.expires_at) : null;
  const now = new Date();
  const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 14 && daysUntilDue >= 0;

  const teacherUsage = institution?.total_teacher_slots ? Math.round((memberCounts.teachers / institution.total_teacher_slots) * 100) : 0;
  const studentUsage = institution?.total_student_slots ? Math.round((memberCounts.students / institution.total_student_slots) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {profile?.first_name || 'Admin'}. Here's your institution overview.
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
                <p className="text-sm text-muted-foreground">Teachers</p>
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
                <p className="text-2xl font-bold text-foreground">{memberCounts.students}/{institution?.total_student_slots || 0}</p>
                <p className="text-sm text-muted-foreground">Students</p>
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
                <p className="text-2xl font-bold text-foreground">{memberCounts.admins}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription & Plan Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">{planLabel}</CardTitle>
                <CardDescription>Your current subscription plan</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOverdue && (
                <Badge variant="destructive">Overdue</Badge>
              )}
              {isDueSoon && !isOverdue && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Due Soon</Badge>
              )}
              {subscription?.payment_status === 'paid' && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Paid</Badge>
              )}
              {subscription?.payment_status === 'unpaid' && (
                <Badge variant="destructive">Unpaid</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Due Date</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {dueDate ? dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
              {daysUntilDue !== null && (
                <p className={`text-xs mt-0.5 ${isOverdue ? 'text-destructive' : isDueSoon ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days remaining`}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Amount</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {subscription?.currency || 'GHS'} {subscription?.total_amount?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {subscription?.subscription_plans?.billing_period || 'monthly'} billing
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Teacher Slots</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {memberCounts.teachers} / {institution?.total_teacher_slots || 0}
              </p>
              <Progress value={teacherUsage} className="h-1.5 mt-1" />
            </div>

            <div className="p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Student Slots</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {memberCounts.students} / {institution?.total_student_slots || 0}
              </p>
              <Progress value={studentUsage} className="h-1.5 mt-1" />
            </div>
          </div>

          {/* Plan Features */}
          {subscription?.subscription_plans?.features && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Plan Features</p>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(subscription.subscription_plans.features) ? subscription.subscription_plans.features : []).map((f: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Upgrade CTA */}
          {!isPremium && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div>
                <p className="text-sm font-medium text-foreground">Want more features & capacity?</p>
                <p className="text-xs text-muted-foreground">Upgrade to Premium for 50k student tokens & 80k teacher tokens</p>
              </div>
              <Button size="sm" onClick={() => setShowUpgradeModal(true)} className="gap-1.5">
                <ArrowUpRight className="w-4 h-4" />
                Upgrade Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upgrade to Premium Institution</DialogTitle>
            <DialogDescription>Unlock higher capacity and more AI tokens for your institution</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-muted">
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-lg font-bold text-foreground mt-1">Pro Institution</p>
                  <p className="text-xs text-muted-foreground mt-2">20 GHS/teacher • 10 GHS/student</p>
                  <p className="text-xs text-muted-foreground">30k teacher tokens • 20k student tokens</p>
                </CardContent>
              </Card>
              <Card className="border-primary">
                <CardContent className="pt-4 text-center">
                  <Badge className="mb-2 bg-primary/10 text-primary">Recommended</Badge>
                  <p className="text-sm text-muted-foreground">Premium Plan</p>
                  <p className="text-lg font-bold text-foreground mt-1">Premium Institution</p>
                  <p className="text-xs text-muted-foreground mt-2">50 GHS/teacher • 20 GHS/student</p>
                  <p className="text-xs text-muted-foreground">80k teacher tokens • 50k student tokens</p>
                </CardContent>
              </Card>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Contact your Jesi AI representative or reach out to support to process the upgrade.
            </p>
            <Button className="w-full" onClick={() => setShowUpgradeModal(false)}>
              Contact Support to Upgrade
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
