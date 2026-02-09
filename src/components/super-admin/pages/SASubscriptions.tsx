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
import { Plus, Loader2, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import EmailPreviewModal from '../components/EmailPreviewModal';

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
  last_renewal_sent_at: string | null;
  renewal_count: number;
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
  const [sendingRenewal, setSendingRenewal] = useState<string | null>(null);

  // Email preview state
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [pendingSubscription, setPendingSubscription] = useState<any>(null);

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

  const handleCreateAndPreview = () => {
    if (!schoolId || !planId) { toast.error('Select a school and plan'); return; }
    if (!invitedEmail) { toast.error('Email is required to send payment link'); return; }

    const school = schools.find(s => s.id === schoolId);
    const plan = plans.find(p => p.id === planId);

    setPendingSubscription({
      institution_id: schoolId,
      plan_id: planId,
      invited_email: invitedEmail,
      teacher_slots: parseInt(teacherSlots) || 0,
      student_slots: parseInt(studentSlots) || 0,
      total_amount: parseFloat(totalAmount) || 0,
      schoolName: school?.name || 'Unknown',
      planName: plan?.name || 'Unknown',
    });

    setCreateOpen(false);
    setEmailPreviewOpen(true);
  };

  const handleSendEmail = async () => {
    if (!pendingSubscription) return;
    setEmailSending(true);

    const { error } = await supabase.from('school_subscriptions').insert({
      institution_id: pendingSubscription.institution_id,
      plan_id: pendingSubscription.plan_id,
      invited_email: pendingSubscription.invited_email,
      teacher_slots: pendingSubscription.teacher_slots,
      student_slots: pendingSubscription.student_slots,
      total_amount: pendingSubscription.total_amount,
      created_by: user?.id,
    } as any);

    if (error) {
      toast.error('Failed to create subscription');
    } else {
      toast.success(`Subscription created! Payment link sent to ${pendingSubscription.invited_email}`);
      setEmailPreviewOpen(false);
      setPendingSubscription(null);
      resetForm();
      fetchData();
    }
    setEmailSending(false);
  };

  const handleSendRenewal = async (sub: SubRow) => {
    if (!sub.invited_email) {
      toast.error('No email address on file for this subscription');
      return;
    }
    setSendingRenewal(sub.id);

    const { error } = await supabase.from('school_subscriptions').update({
      last_renewal_sent_at: new Date().toISOString(),
      renewal_count: (sub.renewal_count || 0) + 1,
    } as any).eq('id', sub.id);

    if (error) {
      toast.error('Failed to send renewal');
    } else {
      toast.success(`Renewal notice sent to ${sub.invited_email}`);
      fetchData();
    }
    setSendingRenewal(null);
  };

  const resetForm = () => {
    setSchoolId(''); setPlanId(''); setInvitedEmail('');
    setTeacherSlots('10'); setStudentSlots('50'); setTotalAmount('0');
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

      {/* Create Subscription Dialog */}
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
              <Label>School Admin Email *</Label>
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
            <Button onClick={handleCreateAndPreview} disabled={saving} variant="hero" className="w-full gap-2">
              <Send className="w-4 h-4" />
              Preview Email & Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Preview Modal */}
      {pendingSubscription && (
        <EmailPreviewModal
          open={emailPreviewOpen}
          onOpenChange={(open) => {
            setEmailPreviewOpen(open);
            if (!open) setPendingSubscription(null);
          }}
          recipientEmail={pendingSubscription.invited_email}
          schoolName={pendingSubscription.schoolName}
          planName={pendingSubscription.planName}
          amount={pendingSubscription.total_amount}
          currency="GHS"
          teacherSlots={pendingSubscription.teacher_slots}
          studentSlots={pendingSubscription.student_slots}
          onSend={handleSendEmail}
          sending={emailSending}
        />
      )}

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
                  <TableHead>Actions</TableHead>
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
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                        disabled={sendingRenewal === s.id}
                        onClick={() => handleSendRenewal(s)}
                        title={s.last_renewal_sent_at ? `Last sent: ${new Date(s.last_renewal_sent_at).toLocaleDateString()} (${s.renewal_count}x)` : 'Send renewal'}
                      >
                        {sendingRenewal === s.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Renew
                      </Button>
                    </TableCell>
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
