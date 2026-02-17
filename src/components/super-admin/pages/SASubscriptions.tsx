import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Loader2, Send, RefreshCw, Search, MoreHorizontal, Pencil, Trash2, Eye, Ban } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

  // Email preview state
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [pendingSubscription, setPendingSubscription] = useState<any>(null);

  // View details
  const [viewSub, setViewSub] = useState<SubRow | null>(null);

  // Edit
  const [editSub, setEditSub] = useState<SubRow | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editTeacherSlots, setEditTeacherSlots] = useState('');
  const [editStudentSlots, setEditStudentSlots] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Delete / Suspend
  const [deleteSub, setDeleteSub] = useState<SubRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [suspendSub, setSuspendSub] = useState<SubRow | null>(null);
  const [suspendingSub, setSuspendingSub] = useState(false);

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
      ...s, institution_name: schoolMap.get(s.institution_id) || 'Unknown', plan_name: planMap.get(s.plan_id) || 'Unknown',
    }));
    setSubs(enriched);
    setSchools((schoolsRes.data as any[]) || []);
    setPlans((plansRes.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredSubs = subs.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (s.institution_name || '').toLowerCase().includes(q) ||
      (s.plan_name || '').toLowerCase().includes(q) ||
      (s.invited_email || '').toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q);
  });

  const handleCreateAndPreview = () => {
    if (!schoolId || !planId) { toast.error('Select a school and plan'); return; }
    if (!invitedEmail) { toast.error('Email is required to send payment link'); return; }
    const school = schools.find(s => s.id === schoolId);
    const plan = plans.find(p => p.id === planId);
    setPendingSubscription({
      institution_id: schoolId, plan_id: planId, invited_email: invitedEmail,
      teacher_slots: parseInt(teacherSlots) || 0, student_slots: parseInt(studentSlots) || 0,
      total_amount: parseFloat(totalAmount) || 0, schoolName: school?.name || 'Unknown', planName: plan?.name || 'Unknown',
    });
    setCreateOpen(false); setEmailPreviewOpen(true);
  };

  const handleSendEmail = async () => {
    if (!pendingSubscription) return;
    setEmailSending(true);
    const { error } = await supabase.from('school_subscriptions').insert({
      institution_id: pendingSubscription.institution_id, plan_id: pendingSubscription.plan_id,
      invited_email: pendingSubscription.invited_email, teacher_slots: pendingSubscription.teacher_slots,
      student_slots: pendingSubscription.student_slots, total_amount: pendingSubscription.total_amount,
      created_by: user?.id,
    } as any);
    if (error) toast.error('Failed to create subscription');
    else { toast.success(`Subscription created! Payment link sent to ${pendingSubscription.invited_email}`); setEmailPreviewOpen(false); setPendingSubscription(null); resetForm(); fetchData(); }
    setEmailSending(false);
  };

  const handleSendRenewal = async (sub: SubRow) => {
    if (!sub.invited_email) { toast.error('No email address on file for this subscription'); return; }
    setSendingRenewal(sub.id);
    const { error } = await supabase.from('school_subscriptions').update({
      last_renewal_sent_at: new Date().toISOString(), renewal_count: (sub.renewal_count || 0) + 1,
    } as any).eq('id', sub.id);
    if (error) toast.error('Failed to send renewal');
    else { toast.success(`Renewal notice sent to ${sub.invited_email}`); fetchData(); }
    setSendingRenewal(null);
  };

  const resetForm = () => { setSchoolId(''); setPlanId(''); setInvitedEmail(''); setTeacherSlots('10'); setStudentSlots('50'); setTotalAmount('0'); };

  const openEditSub = (sub: SubRow) => {
    setEditStatus(sub.status); setEditPaymentStatus(sub.payment_status);
    setEditTeacherSlots(String(sub.teacher_slots)); setEditStudentSlots(String(sub.student_slots));
    setEditAmount(String(sub.total_amount)); setEditSub(sub);
  };

  const handleEditSub = async () => {
    if (!editSub) return;
    setEditSaving(true);
    const { error } = await supabase.from('school_subscriptions').update({
      status: editStatus, payment_status: editPaymentStatus,
      teacher_slots: parseInt(editTeacherSlots) || 0, student_slots: parseInt(editStudentSlots) || 0,
      total_amount: parseFloat(editAmount) || 0,
    } as any).eq('id', editSub.id);
    if (error) toast.error('Failed to update subscription');
    else { toast.success('Subscription updated'); setEditSub(null); fetchData(); }
    setEditSaving(false);
  };

  const handleDeleteSub = async () => {
    if (!deleteSub) return;
    setDeleting(true);
    const { error } = await supabase.from('school_subscriptions').delete().eq('id', deleteSub.id);
    if (error) toast.error('Failed to delete subscription: ' + error.message);
    else { toast.success('Subscription deleted'); setDeleteSub(null); fetchData(); }
    setDeleting(false);
  };

  const handleSuspendSub = async () => {
    if (!suspendSub) return;
    setSuspendingSub(true);
    const { error } = await supabase.from('school_subscriptions').update({ status: 'suspended' } as any).eq('id', suspendSub.id);
    if (error) toast.error('Failed to suspend subscription');
    else { toast.success('Subscription suspended'); setSuspendSub(null); fetchData(); }
    setSuspendingSub(false);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700 border-0">Pending</Badge>;
      case 'expired': return <Badge className="bg-red-100 text-red-700 border-0">Expired</Badge>;
      case 'suspended': return <Badge className="bg-orange-100 text-orange-700 border-0">Suspended</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const paymentBadge = (status: string) => status === 'paid'
    ? <Badge className="bg-green-100 text-green-700 border-0">Paid</Badge>
    : <Badge className="bg-red-100 text-red-700 border-0">Unpaid</Badge>;

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

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search subscriptions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Create Subscription Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create School Subscription</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>School *</Label>
              <Select value={schoolId} onValueChange={setSchoolId}><SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger><SelectContent>{schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label>Plan *</Label>
              <Select value={planId} onValueChange={setPlanId}><SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger><SelectContent>{plans.filter(p => p.plan_type === 'institutional').map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>School Admin Email *</Label><Input type="email" value={invitedEmail} onChange={(e) => setInvitedEmail(e.target.value)} placeholder="admin@school.edu" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Teacher Slots</Label><Input type="number" value={teacherSlots} onChange={(e) => setTeacherSlots(e.target.value)} /></div>
              <div className="space-y-2"><Label>Student Slots</Label><Input type="number" value={studentSlots} onChange={(e) => setStudentSlots(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Total Amount (GHS)</Label><Input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} /></div>
            <Button onClick={handleCreateAndPreview} disabled={saving} variant="hero" className="w-full gap-2"><Send className="w-4 h-4" />Preview Email & Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Preview Modal */}
      {pendingSubscription && (
        <EmailPreviewModal open={emailPreviewOpen} onOpenChange={(open) => { setEmailPreviewOpen(open); if (!open) setPendingSubscription(null); }}
          recipientEmail={pendingSubscription.invited_email} schoolName={pendingSubscription.schoolName}
          planName={pendingSubscription.planName} amount={pendingSubscription.total_amount} currency="GHS"
          teacherSlots={pendingSubscription.teacher_slots} studentSlots={pendingSubscription.student_slots}
          onSend={handleSendEmail} sending={emailSending} />
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filteredSubs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No subscriptions found.</div>
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
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubs.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.institution_name}</TableCell>
                    <TableCell>{s.plan_name}</TableCell>
                    <TableCell>{s.teacher_slots} / {s.student_slots}</TableCell>
                    <TableCell>{s.currency} {s.total_amount}</TableCell>
                    <TableCell>{statusBadge(s.status)}</TableCell>
                    <TableCell>{paymentBadge(s.payment_status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.invited_email || '—'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewSub(s)} className="gap-2"><Eye className="w-4 h-4" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditSub(s)} className="gap-2"><Pencil className="w-4 h-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendRenewal(s)} disabled={sendingRenewal === s.id} className="gap-2"><RefreshCw className="w-4 h-4" /> Send Renewal</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSuspendSub(s)} className="gap-2 text-orange-600 focus:text-orange-600"><Ban className="w-4 h-4" /> Suspend</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteSub(s)} className="gap-2 text-destructive focus:text-destructive"><Trash2 className="w-4 h-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Subscription Details */}
      <Dialog open={!!viewSub} onOpenChange={(o) => !o && setViewSub(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Subscription Details</DialogTitle></DialogHeader>
          {viewSub && (
            <div className="space-y-3 mt-2">
              <div><p className="text-xs text-muted-foreground">School</p><p className="text-sm font-medium">{viewSub.institution_name}</p></div>
              <div><p className="text-xs text-muted-foreground">Plan</p><p className="text-sm font-medium">{viewSub.plan_name}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><div className="mt-1">{statusBadge(viewSub.status)}</div></div>
              <div><p className="text-xs text-muted-foreground">Payment</p><div className="mt-1">{paymentBadge(viewSub.payment_status)}</div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Teacher Slots</p><p className="text-sm font-medium">{viewSub.teacher_slots}</p></div>
                <div><p className="text-xs text-muted-foreground">Student Slots</p><p className="text-sm font-medium">{viewSub.student_slots}</p></div>
              </div>
              <div><p className="text-xs text-muted-foreground">Amount</p><p className="text-sm font-medium">{viewSub.currency} {viewSub.total_amount}</p></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{viewSub.invited_email || '—'}</p></div>
              <div><p className="text-xs text-muted-foreground">Renewals Sent</p><p className="text-sm font-medium">{viewSub.renewal_count}</p></div>
              <div><p className="text-xs text-muted-foreground">Created</p><p className="text-sm font-medium">{new Date(viewSub.created_at).toLocaleDateString()}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Subscription */}
      <Dialog open={!!editSub} onOpenChange={(o) => !o && setEditSub(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Subscription</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="expired">Expired</SelectItem><SelectItem value="suspended">Suspended</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={editPaymentStatus} onValueChange={setEditPaymentStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unpaid">Unpaid</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Teacher Slots</Label><Input type="number" value={editTeacherSlots} onChange={(e) => setEditTeacherSlots(e.target.value)} /></div>
              <div className="space-y-2"><Label>Student Slots</Label><Input type="number" value={editStudentSlots} onChange={(e) => setEditStudentSlots(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Amount</Label><Input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} /></div>
            <Button onClick={handleEditSub} disabled={editSaving} variant="hero" className="w-full gap-2">
              {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />} Update Subscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSub} onOpenChange={(o) => !o && setDeleteSub(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Trash2 className="w-5 h-5 text-destructive" />Delete Subscription</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete the subscription for <strong>{deleteSub?.institution_name}</strong>? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSub} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation */}
      <AlertDialog open={!!suspendSub} onOpenChange={(o) => !o && setSuspendSub(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Ban className="w-5 h-5 text-orange-600" />Suspend Subscription</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to suspend the subscription for <strong>{suspendSub?.institution_name}</strong>?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={suspendingSub}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspendSub} className="bg-orange-600 text-white hover:bg-orange-700" disabled={suspendingSub}>
              {suspendingSub ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SASubscriptions;
