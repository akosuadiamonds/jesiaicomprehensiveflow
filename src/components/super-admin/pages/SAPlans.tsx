import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';

interface PlanRow {
  id: string;
  name: string;
  plan_type: string;
  price: number;
  currency: string;
  billing_period: string;
  token_allocation: number;
  features: string[];
  is_active: boolean;
}

const SAPlans: React.FC = () => {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanRow | null>(null);

  // Form
  const [name, setName] = useState('');
  const [planType, setPlanType] = useState('individual');
  const [price, setPrice] = useState('0');
  const [currency, setCurrency] = useState('GHS');
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [tokenAllocation, setTokenAllocation] = useState('5000');
  const [featuresText, setFeaturesText] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchPlans = async () => {
    const { data } = await supabase.from('subscription_plans').select('*').order('created_at');
    setPlans((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setName(''); setPlanType('individual'); setPrice('0'); setCurrency('GHS');
    setBillingPeriod('monthly'); setTokenAllocation('5000'); setFeaturesText(''); setIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (plan: PlanRow) => {
    setEditingPlan(plan);
    setName(plan.name); setPlanType(plan.plan_type); setPrice(String(plan.price)); setCurrency(plan.currency);
    setBillingPeriod(plan.billing_period); setTokenAllocation(String(plan.token_allocation));
    setFeaturesText((plan.features || []).join('\n')); setIsActive(plan.is_active);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Plan name is required'); return; }
    setSaving(true);

    const features = featuresText.split('\n').map(f => f.trim()).filter(Boolean);
    const payload: any = {
      name: name.trim(), plan_type: planType, price: parseFloat(price) || 0, currency,
      billing_period: billingPeriod, token_allocation: parseInt(tokenAllocation) || 0,
      features: JSON.stringify(features), is_active: isActive,
    };

    if (editingPlan) {
      const { error } = await supabase.from('subscription_plans').update(payload).eq('id', editingPlan.id);
      if (error) toast.error('Failed to update plan'); else toast.success('Plan updated');
    } else {
      const { error } = await supabase.from('subscription_plans').insert(payload);
      if (error) toast.error('Failed to create plan'); else toast.success('Plan created');
    }
    setSaving(false);
    setDialogOpen(false);
    fetchPlans();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription Plans</h1>
          <p className="text-muted-foreground mt-1">Create and manage platform subscription plans</p>
        </div>
        <Button variant="hero" className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" /> New Plan
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Plan Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pro" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={planType} onValueChange={setPlanType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="institutional">Institutional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Billing Period</Label>
                <Select value={billingPeriod} onValueChange={setBillingPeriod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="5 days">5 Days Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price ({currency})</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Token Allocation</Label>
                <Input type="number" value={tokenAllocation} onChange={(e) => setTokenAllocation(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder="Feature 1&#10;Feature 2"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Active</Label>
            </div>
            <Button onClick={handleSave} disabled={saving} variant="hero" className="w-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{p.plan_type}</Badge></TableCell>
                    <TableCell>{p.currency} {p.price}</TableCell>
                    <TableCell>{p.token_allocation.toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{p.billing_period}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_active ? 'default' : 'secondary'}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                        <Pencil className="w-4 h-4" />
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

export default SAPlans;
