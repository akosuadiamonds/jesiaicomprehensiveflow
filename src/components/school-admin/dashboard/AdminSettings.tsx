import React, { useState } from 'react';
import { useAdmin } from '../SchoolAdminApp';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings: React.FC = () => {
  const { institution, refreshInstitution } = useAdmin();
  const [name, setName] = useState(institution?.name || '');
  const [address, setAddress] = useState(institution?.address || '');
  const [city, setCity] = useState(institution?.city || '');
  const [region, setRegion] = useState(institution?.region || '');
  const [phone, setPhone] = useState(institution?.phone || '');
  const [email, setEmail] = useState(institution?.email || '');
  const [saving, setSaving] = useState(false);

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
            <Button variant="outline" disabled>Upgrade (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
