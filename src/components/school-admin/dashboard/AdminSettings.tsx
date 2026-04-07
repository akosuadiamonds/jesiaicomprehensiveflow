import React, { useState, useEffect } from 'react';
import { useAdmin } from '../SchoolAdminApp';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Save, Loader2, ArrowUpCircle, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import UpgradePlanModal from '@/components/upgrade/UpgradePlanModal';

const ACADEMIC_YEARS = ['2025/2026', '2024/2025', '2023/2024', '2026/2027'];
const TERMS = ['Term 1', 'Term 2', 'Term 3'];

const AdminSettings: React.FC = () => {
  const { institution, refreshInstitution } = useAdmin();
  const [name, setName] = useState(institution?.name || '');
  const [address, setAddress] = useState(institution?.address || '');
  const [city, setCity] = useState(institution?.city || '');
  const [region, setRegion] = useState(institution?.region || '');
  const [phone, setPhone] = useState(institution?.phone || '');
  const [email, setEmail] = useState(institution?.email || '');
  const [saving, setSaving] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Academic year settings (stored in localStorage per institution)
  const storageKey = `jesi_academic_settings_${institution?.id}`;
  const savedSettings = institution ? JSON.parse(localStorage.getItem(storageKey) || '{}') : {};
  const [academicYear, setAcademicYear] = useState(savedSettings.academicYear || '2025/2026');
  const [currentTerm, setCurrentTerm] = useState(savedSettings.currentTerm || 'Term 1');
  const [termStartDate, setTermStartDate] = useState(savedSettings.termStartDate || '');
  const [termEndDate, setTermEndDate] = useState(savedSettings.termEndDate || '');
  const [savingAcademic, setSavingAcademic] = useState(false);

  const handleSave = async () => {
    if (!institution) return;
    setSaving(true);

    const { error } = await supabase
      .from('institutions' as any)
      .update({ name, address, city, region, phone, email })
      .eq('id', institution.id);

    if (error) {
      toast.error('Failed to update institution details');
    } else {
      toast.success('Institution details updated');
      await refreshInstitution();
    }
    setSaving(false);
  };

  const handleSaveAcademic = () => {
    if (!institution) return;
    setSavingAcademic(true);
    const settings = { academicYear, currentTerm, termStartDate, termEndDate };
    localStorage.setItem(storageKey, JSON.stringify(settings));
    toast.success('Academic year settings saved');
    setSavingAcademic(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your institution settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Institution Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>School Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <Button onClick={handleSave} disabled={saving} variant="hero" className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Academic Year Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Academic Year Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Current Term</Label>
              <Select value={currentTerm} onValueChange={setCurrentTerm}>
                <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                <SelectContent>
                  {TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Term Start Date</Label>
              <Input type="date" value={termStartDate} onChange={(e) => setTermStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Term End Date</Label>
              <Input type="date" value={termEndDate} onChange={(e) => setTermEndDate(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSaveAcademic} disabled={savingAcademic} variant="hero" className="gap-2">
            {savingAcademic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Academic Settings
          </Button>
        </CardContent>
      </Card>

      {/* Plan Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">
                {institution?.selected_plan === 'premium_institution' ? 'Premium Institution' : 'Pro Institution'}
              </p>
              <p className="text-sm text-muted-foreground">
                {institution?.total_teacher_slots} teacher slots • {institution?.total_student_slots} student slots
              </p>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setUpgradeOpen(true)}>
              <ArrowUpCircle className="w-4 h-4" />
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <UpgradePlanModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
};

export default AdminSettings;
