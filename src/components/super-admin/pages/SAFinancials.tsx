import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
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

interface PaymentMethod {
  id: string;
  institution_id: string;
  method_type: string;
  provider: string | null;
  account_number: string | null;
  account_name: string | null;
  is_default: boolean;
  is_active: boolean;
  institution_name?: string;
}

const SAFinancials: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [addPmOpen, setAddPmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Transaction form
  const [txSchoolId, setTxSchoolId] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txMethod, setTxMethod] = useState('mobile_money');
  const [txReference, setTxReference] = useState('');
  const [txStatus, setTxStatus] = useState('completed');
  const [txType, setTxType] = useState('payment');
  const [txNotes, setTxNotes] = useState('');

  // Payment method form
  const [pmSchoolId, setPmSchoolId] = useState('');
  const [pmType, setPmType] = useState('mobile_money');
  const [pmProvider, setPmProvider] = useState('');
  const [pmAccountNumber, setPmAccountNumber] = useState('');
  const [pmAccountName, setPmAccountName] = useState('');

  const fetchData = async () => {
    const [txRes, pmRes, schoolsRes] = await Promise.all([
      supabase.from('payment_transactions').select('*').order('transaction_date', { ascending: false }),
      supabase.from('payment_methods').select('*').order('created_at', { ascending: false }),
      supabase.from('institutions').select('id, name'),
    ]);

    const schoolMap = new Map((schoolsRes.data as any[] || []).map((s: any) => [s.id, s.name]));

    setTransactions(((txRes.data as any[]) || []).map((t: any) => ({
      ...t,
      institution_name: schoolMap.get(t.institution_id) || 'Unknown',
    })));

    setPaymentMethods(((pmRes.data as any[]) || []).map((p: any) => ({
      ...p,
      institution_name: schoolMap.get(p.institution_id) || 'Unknown',
    })));

    setSchools((schoolsRes.data as any[]) || []);
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
    else { toast.success('Transaction recorded'); setAddTxOpen(false); fetchData(); }
    setSaving(false);
  };

  const handleAddPaymentMethod = async () => {
    if (!pmSchoolId || !pmProvider) { toast.error('School and provider required'); return; }
    setSaving(true);
    const { error } = await supabase.from('payment_methods').insert({
      institution_id: pmSchoolId,
      method_type: pmType,
      provider: pmProvider,
      account_number: pmAccountNumber || null,
      account_name: pmAccountName || null,
      created_by: user?.id,
    } as any);
    if (error) toast.error('Failed to add payment method');
    else { toast.success('Payment method added'); setAddPmOpen(false); fetchData(); }
    setSaving(false);
  };

  // Financial summary
  const totalRevenue = transactions.filter(t => t.status === 'completed' && t.transaction_type === 'payment').reduce((sum, t) => sum + t.amount, 0);
  const totalRenewals = transactions.filter(t => t.status === 'completed' && t.transaction_type === 'renewal').reduce((sum, t) => sum + t.amount, 0);
  const pendingPayments = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
  const totalRefunds = transactions.filter(t => t.transaction_type === 'refund').reduce((sum, t) => sum + t.amount, 0);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700',
    };
    return <Badge className={`${map[status] || ''} border-0`}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financial Reports</h1>
        <p className="text-muted-foreground mt-1">Track payments, revenue, and financial health</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
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

        <TabsContent value="payment-methods" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="hero" className="gap-2" onClick={() => setAddPmOpen(true)}>
              <Plus className="w-4 h-4" /> Add Payment Method
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No payment methods added yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>School</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods.map((pm) => (
                      <TableRow key={pm.id}>
                        <TableCell className="font-medium">{pm.institution_name}</TableCell>
                        <TableCell className="capitalize">{pm.method_type.replace('_', ' ')}</TableCell>
                        <TableCell>{pm.provider || '—'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {pm.account_name ? `${pm.account_name} • ` : ''}{pm.account_number || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={pm.is_active ? 'bg-green-100 text-green-700 border-0' : 'bg-red-100 text-red-700 border-0'}>
                            {pm.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {pm.is_default && <Badge className="ml-1 bg-blue-100 text-blue-700 border-0">Default</Badge>}
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

      {/* Add Payment Method Dialog */}
      <Dialog open={addPmOpen} onOpenChange={setAddPmOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Payment Method</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>School *</Label>
              <Select value={pmSchoolId} onValueChange={setPmSchoolId}>
                <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
                <SelectContent>
                  {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={pmType} onValueChange={setPmType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Provider *</Label>
              <Input value={pmProvider} onChange={(e) => setPmProvider(e.target.value)} placeholder="e.g. MTN, Vodafone, Visa" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input value={pmAccountName} onChange={(e) => setPmAccountName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input value={pmAccountNumber} onChange={(e) => setPmAccountNumber(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleAddPaymentMethod} disabled={saving} variant="hero" className="w-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Add Payment Method
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SAFinancials;
