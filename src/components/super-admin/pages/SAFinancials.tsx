import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, DollarSign, TrendingUp, CreditCard, Coins, Users, GraduationCap, School, BookOpen, CheckCircle, XCircle, Download, FileText, Clock, ArrowDownLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  institution_id: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  reference_number: string | null;
  status: string;
  transaction_type: string;
  notes: string | null;
  transaction_date: string;
  institution_name?: string;
}

interface CashoutRequest {
  id: string;
  teacher_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  account_details: any;
  status: string;
  admin_notes: string | null;
  created_at: string;
  teacher_name?: string;
}

const SAFinancials: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashoutRequests, setCashoutRequests] = useState<CashoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Cashout review
  const [reviewingCashout, setReviewingCashout] = useState<CashoutRequest | null>(null);
  const [cashoutAction, setCashoutAction] = useState<'approved' | 'rejected'>('approved');
  const [cashoutNotes, setCashoutNotes] = useState('');
  const [processingCashout, setProcessingCashout] = useState(false);

  // User counts for revenue by user
  const [learnerCount, setLearnerCount] = useState(0);
  const [schoolCount, setSchoolCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);

  const fetchData = async () => {
    const [txRes, cashoutRes, profilesRes, institutionsRes] = await Promise.all([
      supabase.from('payment_transactions').select('*').order('transaction_date', { ascending: false }),
      supabase.from('cashout_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('user_id, first_name, last_name, user_role'),
      supabase.from('institutions').select('id, name'),
    ]);

    const profiles = (profilesRes.data as any[]) || [];
    const institutions = (institutionsRes.data as any[]) || [];
    const schoolMap = new Map(institutions.map((s: any) => [s.id, s.name]));
    const teacherMap = new Map(
      profiles.filter(p => p.user_role === 'teacher').map((p: any) => [p.user_id, `${p.first_name || ''} ${p.last_name || ''}`.trim()])
    );

    setLearnerCount(profiles.filter(p => p.user_role === 'learner').length);
    setTeacherCount(profiles.filter(p => p.user_role === 'teacher').length);
    setSchoolCount(institutions.length);

    setTransactions(((txRes.data as any[]) || []).map((t: any) => ({
      ...t,
      institution_name: schoolMap.get(t.institution_id) || 'Unknown',
    })));

    setCashoutRequests(((cashoutRes.data as any[]) || []).map((c: any) => ({
      ...c,
      teacher_name: teacherMap.get(c.teacher_id) || 'Unknown Teacher',
    })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Cashout approval
  const handleCashoutReview = async () => {
    if (!reviewingCashout) return;
    setProcessingCashout(true);
    const { error } = await supabase.from('cashout_requests').update({
      status: cashoutAction,
      admin_notes: cashoutNotes || null,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    } as any).eq('id', reviewingCashout.id);
    if (error) {
      toast.error('Failed to process cashout request');
    } else {
      toast.success(`Cashout request ${cashoutAction}`);
      setReviewingCashout(null);
      setCashoutNotes('');
      fetchData();
    }
    setProcessingCashout(false);
  };

  // Download report
  const downloadReport = () => {
    const headers = ['Date', 'School', 'Type', 'Method', 'Amount', 'Currency', 'Reference', 'Status'];
    const rows = transactions.map(t => [
      new Date(t.transaction_date).toLocaleDateString(),
      t.institution_name || '',
      t.transaction_type,
      t.payment_method || '',
      t.amount.toFixed(2),
      t.currency,
      t.reference_number || '',
      t.status,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  // Financial calculations
  const completedTx = transactions.filter(t => t.status === 'completed');
  const subscriptionRevenue = completedTx.filter(t => t.transaction_type === 'payment' || t.transaction_type === 'renewal').reduce((s, t) => s + t.amount, 0);
  const tokenRevenue = completedTx.filter(t => t.transaction_type === 'token_purchase').reduce((s, t) => s + t.amount, 0);
  const feeRevenue = completedTx.filter(t => t.transaction_type === 'fee').reduce((s, t) => s + t.amount, 0);

  const pendingPayments = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
  const pendingCashouts = cashoutRequests.filter(c => c.status === 'pending');
  const pendingCashoutTotal = pendingCashouts.reduce((s, c) => s + c.amount, 0);
  const totalRefunds = transactions.filter(t => t.transaction_type === 'refund').reduce((s, t) => s + t.amount, 0);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-700',
      approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
    };
    return <Badge className={`${map[status] || ''} border-0`}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">Track revenue, payments, and manage cashout requests</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={downloadReport}>
          <Download className="w-4 h-4" /> Download Report
        </Button>
      </div>

      {/* Revenue by Type */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Revenue by Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Subscriptions</CardTitle>
              <CreditCard className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">GHS {subscriptionRevenue.toFixed(2)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tokens</CardTitle>
              <Coins className="w-5 h-5 text-amber-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">GHS {tokenRevenue.toFixed(2)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fees</CardTitle>
              <DollarSign className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">GHS {feeRevenue.toFixed(2)}</div></CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue by User */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Revenue by User</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Learners</CardTitle>
              <GraduationCap className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{learnerCount}</div>
              <p className="text-xs text-muted-foreground mt-1">registered learners</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Schools</CardTitle>
              <School className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schoolCount}</div>
              <p className="text-xs text-muted-foreground mt-1">registered schools</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Teachers</CardTitle>
              <BookOpen className="w-5 h-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teacherCount}</div>
              <p className="text-xs text-muted-foreground mt-1">registered teachers</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payments Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Payments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
              <Clock className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">GHS {pendingPayments.toFixed(2)}</div></CardContent>
          </Card>
          <Card className={pendingCashouts.length > 0 ? 'border-orange-300' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Cashouts</CardTitle>
              <FileText className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">GHS {pendingCashoutTotal.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">{pendingCashouts.length} request{pendingCashouts.length !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Refunds</CardTitle>
              <ArrowDownLeft className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">GHS {totalRefunds.toFixed(2)}</div></CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs: Transactions & Cashout Requests */}
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="cashouts" className="gap-1">
            Cashout Requests
            {pendingCashouts.length > 0 && (
              <Badge className="bg-orange-500 text-white border-0 ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {pendingCashouts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No transactions recorded yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-sm">{new Date(t.transaction_date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{t.institution_name}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{t.transaction_type}</Badge></TableCell>
                        <TableCell className="capitalize text-sm text-muted-foreground">{t.payment_method?.replace('_', ' ') || '—'}</TableCell>
                        <TableCell className="font-medium">{t.currency} {t.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">{t.reference_number || '—'}</TableCell>
                        <TableCell>{statusBadge(t.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cashout Requests Tab */}
        <TabsContent value="cashouts" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : cashoutRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No cashout requests yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashoutRequests.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{c.teacher_name}</TableCell>
                        <TableCell className="font-medium">{c.currency} {c.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-sm capitalize">{c.payment_method.replace('_', ' ')}</TableCell>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                        <TableCell>
                          {c.status === 'pending' ? (
                            <Button size="sm" variant="outline" onClick={() => { setReviewingCashout(c); setCashoutAction('approved'); setCashoutNotes(''); }}>
                              Review
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">{c.admin_notes || '—'}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cashout Review Dialog */}
      <Dialog open={!!reviewingCashout} onOpenChange={(o) => !o && setReviewingCashout(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Cashout Request</DialogTitle>
          </DialogHeader>
          {reviewingCashout && (
            <div className="space-y-4 mt-2">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Teacher</span>
                  <span className="text-sm font-medium">{reviewingCashout.teacher_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-sm font-bold">{reviewingCashout.currency} {reviewingCashout.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Method</span>
                  <span className="text-sm capitalize">{reviewingCashout.payment_method.replace('_', ' ')}</span>
                </div>
                {reviewingCashout.account_details && Object.keys(reviewingCashout.account_details).length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Account Details</p>
                    {Object.entries(reviewingCashout.account_details).map(([key, val]) => (
                      <p key={key} className="text-sm"><span className="capitalize text-muted-foreground">{key.replace('_', ' ')}:</span> {String(val)}</p>
                    ))}
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Requested</span>
                  <span className="text-sm">{new Date(reviewingCashout.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Decision</Label>
                <Select value={cashoutAction} onValueChange={(v) => setCashoutAction(v as 'approved' | 'rejected')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">✅ Approve</SelectItem>
                    <SelectItem value="rejected">❌ Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Admin Notes (optional)</Label>
                <Textarea value={cashoutNotes} onChange={(e) => setCashoutNotes(e.target.value)} placeholder="Reason or notes for this decision..." rows={3} />
              </div>

              <Button
                onClick={handleCashoutReview}
                disabled={processingCashout}
                variant={cashoutAction === 'approved' ? 'hero' : 'destructive'}
                className="w-full gap-2"
              >
                {processingCashout ? <Loader2 className="w-4 h-4 animate-spin" /> : cashoutAction === 'approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {cashoutAction === 'approved' ? 'Approve Cashout' : 'Reject Cashout'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SAFinancials;
