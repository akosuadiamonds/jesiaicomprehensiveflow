import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, DollarSign, TrendingUp, TrendingDown, CreditCard, Pencil, Trash2, CheckCircle, XCircle, Download, FileText } from 'lucide-react';
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

interface PlatformPaymentMethod {
  id: string;
  method_type: string;
  provider: string | null;
  account_number: string | null;
  account_name: string | null;
  is_default: boolean;
  is_active: boolean;
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
  const [paymentMethods, setPaymentMethods] = useState<PlatformPaymentMethod[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [cashoutRequests, setCashoutRequests] = useState<CashoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [pmDialogOpen, setPmDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPm, setEditingPm] = useState<PlatformPaymentMethod | null>(null);

  // Cashout review
  const [reviewingCashout, setReviewingCashout] = useState<CashoutRequest | null>(null);
  const [cashoutAction, setCashoutAction] = useState<'approved' | 'rejected'>('approved');
  const [cashoutNotes, setCashoutNotes] = useState('');
  const [processingCashout, setProcessingCashout] = useState(false);

  // Transaction form
  const [txSchoolId, setTxSchoolId] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txMethod, setTxMethod] = useState('mobile_money');
  const [txReference, setTxReference] = useState('');
  const [txStatus, setTxStatus] = useState('completed');
  const [txType, setTxType] = useState('payment');
  const [txNotes, setTxNotes] = useState('');

  // Payment method form
  const [pmType, setPmType] = useState('mobile_money');
  const [pmProvider, setPmProvider] = useState('');
  const [pmAccountNumber, setPmAccountNumber] = useState('');
  const [pmAccountName, setPmAccountName] = useState('');
  const [pmIsDefault, setPmIsDefault] = useState(false);
  const [pmIsActive, setPmIsActive] = useState(true);

  const fetchData = async () => {
    const [txRes, pmRes, schoolsRes, cashoutRes, profilesRes] = await Promise.all([
      supabase.from('payment_transactions').select('*').order('transaction_date', { ascending: false }),
      supabase.from('payment_methods').select('*').is('institution_id', null).order('created_at', { ascending: false }),
      supabase.from('institutions').select('id, name'),
      supabase.from('cashout_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('user_id, first_name, last_name').eq('user_role', 'teacher'),
    ]);

    const schoolMap = new Map((schoolsRes.data as any[] || []).map((s: any) => [s.id, s.name]));
    const teacherMap = new Map((profilesRes.data as any[] || []).map((p: any) => [p.user_id, `${p.first_name || ''} ${p.last_name || ''}`.trim()]));

    setTransactions(((txRes.data as any[]) || []).map((t: any) => ({
      ...t,
      institution_name: schoolMap.get(t.institution_id) || 'Unknown',
    })));

    setPaymentMethods((pmRes.data as any[]) || []);
    setSchools((schoolsRes.data as any[]) || []);
    setCashoutRequests(((cashoutRes.data as any[]) || []).map((c: any) => ({
      ...c,
      teacher_name: teacherMap.get(c.teacher_id) || 'Unknown Teacher',
    })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddTransaction = async () => {
    if (!txSchoolId || !txAmount) { toast.error('School and amount are required'); return; }
    setSaving(true);
    const { error } = await supabase.from('payment_transactions').insert({
      institution_id: txSchoolId,
      amount: parseFloat(txAmount) || 0,
      payment_method: txMethod,
      reference_number: txReference || null,
      status: txStatus,
      transaction_type: txType,
      notes: txNotes || null,
      recorded_by: user?.id,
    } as any);
    if (error) toast.error('Failed to record transaction');
    else { toast.success('Transaction recorded'); setAddTxOpen(false); resetTxForm(); fetchData(); }
    setSaving(false);
  };

  const resetTxForm = () => {
    setTxSchoolId(''); setTxAmount(''); setTxMethod('mobile_money');
    setTxReference(''); setTxStatus('completed'); setTxType('payment'); setTxNotes('');
  };

  const openCreatePm = () => {
    setEditingPm(null);
    setPmType('mobile_money'); setPmProvider(''); setPmAccountNumber('');
    setPmAccountName(''); setPmIsDefault(false); setPmIsActive(true);
    setPmDialogOpen(true);
  };

  const openEditPm = (pm: PlatformPaymentMethod) => {
    setEditingPm(pm);
    setPmType(pm.method_type); setPmProvider(pm.provider || '');
    setPmAccountNumber(pm.account_number || ''); setPmAccountName(pm.account_name || '');
    setPmIsDefault(pm.is_default); setPmIsActive(pm.is_active);
    setPmDialogOpen(true);
  };

  const handleSavePaymentMethod = async () => {
    if (!pmProvider.trim()) { toast.error('Provider is required'); return; }
    setSaving(true);
    const payload: any = {
      method_type: pmType, provider: pmProvider.trim(),
      account_number: pmAccountNumber || null, account_name: pmAccountName || null,
      is_default: pmIsDefault, is_active: pmIsActive, institution_id: null,
    };
    if (editingPm) {
      const { error } = await supabase.from('payment_methods').update(payload).eq('id', editingPm.id);
      if (error) toast.error('Failed to update payment method');
      else toast.success('Payment method updated');
    } else {
      payload.created_by = user?.id;
      const { error } = await supabase.from('payment_methods').insert(payload);
      if (error) toast.error('Failed to add payment method');
      else toast.success('Payment method added');
    }
    setSaving(false); setPmDialogOpen(false); fetchData();
  };

  const handleDeletePm = async (id: string) => {
    const { error } = await supabase.from('payment_methods').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else { toast.success('Payment method removed'); fetchData(); }
  };

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

  // Financial summary
  const totalRevenue = transactions.filter(t => t.status === 'completed' && t.transaction_type === 'payment').reduce((sum, t) => sum + t.amount, 0);
  const totalRenewals = transactions.filter(t => t.status === 'completed' && t.transaction_type === 'renewal').reduce((sum, t) => sum + t.amount, 0);
  const pendingPayments = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
  const totalRefunds = transactions.filter(t => t.transaction_type === 'refund').reduce((sum, t) => sum + t.amount, 0);
  const pendingCashouts = cashoutRequests.filter(c => c.status === 'pending');

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-700',
      approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
    };
    return <Badge className={`${map[status] || ''} border-0`}>{status}</Badge>;
  };

  const methodTypeLabel = (type: string) => {
    switch (type) {
      case 'mobile_money': return 'Mobile Money';
      case 'bank_transfer': return 'Bank Transfer';
      case 'card': return 'Card';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">Track payments, revenue, and manage cashout requests</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={downloadReport}>
          <Download className="w-4 h-4" /> Download Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">GHS {totalRevenue.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Renewal Revenue</CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">GHS {totalRenewals.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
            <CreditCard className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">GHS {pendingPayments.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Refunds</CardTitle>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">GHS {totalRefunds.toFixed(2)}</div></CardContent>
        </Card>
        <Card className={pendingCashouts.length > 0 ? 'border-orange-300' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Cashouts</CardTitle>
            <FileText className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pendingCashouts.length}</div></CardContent>
        </Card>
      </div>

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
          <TabsTrigger value="payment-methods">Accepted Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="hero" className="gap-2" onClick={() => setAddTxOpen(true)}>
              <Plus className="w-4 h-4" /> Record Transaction
            </Button>
          </div>

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

        <TabsContent value="payment-methods" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">These are the payment methods accepted by the platform.</p>
            <Button variant="hero" className="gap-2" onClick={openCreatePm}>
              <Plus className="w-4 h-4" /> Add Method
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : paymentMethods.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">No payment methods added yet.</div>
            ) : (
              paymentMethods.map((pm) => (
                <Card key={pm.id} className={`relative ${!pm.is_active ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">{pm.provider}</CardTitle>
                      <div className="flex items-center gap-1">
                        {pm.is_default && <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Default</Badge>}
                        {!pm.is_active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{methodTypeLabel(pm.method_type)}</span>
                    </div>
                    {pm.account_name && <p className="text-sm text-muted-foreground">Name: <span className="text-foreground">{pm.account_name}</span></p>}
                    {pm.account_number && <p className="text-sm text-muted-foreground">Number: <span className="text-foreground font-mono">{pm.account_number}</span></p>}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => openEditPm(pm)}>
                        <Pencil className="w-3 h-3" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive" onClick={() => handleDeletePm(pm.id)}>
                        <Trash2 className="w-3 h-3" /> Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Transaction Dialog */}
      <Dialog open={addTxOpen} onOpenChange={setAddTxOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record Transaction</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>School *</Label>
              <Select value={txSchoolId} onValueChange={setTxSchoolId}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>
                  {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (GHS) *</Label>
                <Input type="number" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={txType} onValueChange={setTxType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="renewal">Renewal</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={txMethod} onValueChange={setTxMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={txStatus} onValueChange={setTxStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input value={txReference} onChange={(e) => setTxReference(e.target.value)} placeholder="e.g. TXN-123456" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={txNotes} onChange={(e) => setTxNotes(e.target.value)} placeholder="Optional note" />
            </div>
            <Button onClick={handleAddTransaction} disabled={saving} variant="hero" className="w-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              Record Transaction
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Payment Method Dialog */}
      <Dialog open={pmDialogOpen} onOpenChange={setPmDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPm ? 'Edit Payment Method' : 'Add Accepted Payment Method'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">Configure a payment method that the platform accepts from schools.</p>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={pmType} onValueChange={setPmType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile_money">Mobile Money (MoMo)</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Provider / Network *</Label>
              <Input value={pmProvider} onChange={(e) => setPmProvider(e.target.value)} placeholder="e.g. MTN MoMo, Vodafone Cash" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input value={pmAccountName} onChange={(e) => setPmAccountName(e.target.value)} placeholder="e.g. Jesi AI Ltd" />
              </div>
              <div className="space-y-2">
                <Label>Account / Phone Number</Label>
                <Input value={pmAccountNumber} onChange={(e) => setPmAccountNumber(e.target.value)} placeholder="e.g. 024XXXXXXX" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={pmIsDefault} onCheckedChange={setPmIsDefault} />
                <Label>Set as default</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={pmIsActive} onCheckedChange={setPmIsActive} />
                <Label>Active</Label>
              </div>
            </div>
            <Button onClick={handleSavePaymentMethod} disabled={saving} variant="hero" className="w-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {editingPm ? 'Update Method' : 'Add Method'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
