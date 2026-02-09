import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface SubRow {
  id: string;
  institution_id: string;
  plan_id: string;
  status: string;
  payment_status: string;
  invited_email: string | null;
  teacher_slots: number;
  student_slots: number;
  total_amount: number;
  currency: string;
  created_at: string;
  institution_name?: string;
  plan_name?: string;
}

const SASubscriptions: React.FC = () => {
  const { user } = useAuth();
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [plans, setPlans] = useState<{ id: string; name: string; plan_type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [schoolId, setSchoolId] = useState('');
  const [planId, setPlanId] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [teacherSlots, setTeacherSlots] = useState('10');
  const [studentSlots, setStudentSlots] = useState('50');
  const [totalAmount, setTotalAmount] = useState('0');

  const fetchData = async () => {
    const [subsRes, schoolsRes, plansRes] = await Promise.all([
      supabase.from('school_subscriptions').select('*').order('created_at', { ascending: false }),
      supabase.from('institutions').select('id, name'),
      supabase.from('subscription_plans').select('id, name, plan_type').eq('is_active', true),
    ]);

    const schoolMap = new Map((schoolsRes.data as any[] || []).map((s: any) => [s.id, s.name]));
    const planMap = new Map((plansRes.data as any[] || []).map((p: any) => [p.id, p.name]));

    const enriched = ((subsRes.data as any[]) || []).map((s: any) => ({
      ...s,
      institution_name: schoolMap.get(s.institution_id) || 'Unknown',
      plan_name: planMap.get(s.plan_id) || 'Unknown',
    }));

    setSubs(enriched);
    setSchools((schoolsRes.data as any[]) || []);
    setPlans((plansRes.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!schoolId || !planId) { toast.error('Select a school and plan'); return; }
    setSaving(true);

    const { error } = await supabase.from('school_subscriptions').insert({
      institution_id: schoolId,
      plan_id: planId,
      invited_email: invitedEmail || null,
      teacher_slots: parseInt(teacherSlots) || 0,
      student_slots: parseInt(studentSlots) || 0,
      total_amount: parseFloat(totalAmount) || 0,
      created_by: user?.id,
    } as any);

    if (error) {
      toast.error('Failed to create subscription');
    } else {
      toast.success(invitedEmail 
        ? `Subscription created! Payment link would be sent to ${invitedEmail}` 
        : 'Subscription created successfully'
      );
      setCreateOpen(false);
      fetchData();
    }
    setSaving(false);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700 border-0">Pending</Badge>;
      case 'expired': return <Badge className="bg-red-100 text-red-700 border-0">Expired</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const paymentBadge = (status: string) => {
    return status === 'paid'
      ? <Badge className="bg-green-100 text-green-700 border-0">Paid</Badge>
      : <Badge className="bg-red-100 text-red-700 border-0">Unpaid</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">School Subscriptions</h1>
          <p className="text-muted-foreground mt-1">Create and manage subscriptions for schools</p>
        </div>
        <Button variant="hero" className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Create Subscription
        </Button>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create School Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>School *</Label>
              <Select value={schoolId} onValueChange={setSchoolId}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>
                  {schools.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plan *</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>
                  {plans.filter(p => p.plan_type === 'institutional').map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>School Admin Email (to send payment link)</Label>
              <Input type="email" value={invitedEmail} onChange={(e) => setInvitedEmail(e.target.value)}
                placeholder="admin@school.edu" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teacher Slots</Label>
                <Input type="number" value={teacherSlots} onChange={(e) => setTeacherSlots(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Student Slots</Label>
                <Input type="number" value={studentSlots} onChange={(e) => setStudentSlots(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Total Amount (GHS)</Label>
              <Input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
            </div>
            <Button onClick={handleCreate} disabled={saving} variant="hero" className="w-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Create & Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : subs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No subscriptions yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Slots (T/S)</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subs.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.institution_name}</TableCell>
                    <TableCell>{s.plan_name}</TableCell>
                    <TableCell>{s.teacher_slots} / {s.student_slots}</TableCell>
                    <TableCell>{s.currency} {s.total_amount}</TableCell>
                    <TableCell>{statusBadge(s.status)}</TableCell>
                    <TableCell>{paymentBadge(s.payment_status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.invited_email || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SASubscriptions;
