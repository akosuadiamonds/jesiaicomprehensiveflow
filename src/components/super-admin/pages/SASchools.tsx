import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, School, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface InstitutionRow {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  email: string | null;
  phone: string | null;
  selected_plan: string;
  total_teacher_slots: number;
  total_student_slots: number;
  created_at: string;
}

const SASchools: React.FC = () => {
  const { user } = useAuth();
  const [schools, setSchools] = useState<InstitutionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Create form
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('pro_institution');
  const [teacherSlots, setTeacherSlots] = useState('10');
  const [studentSlots, setStudentSlots] = useState('50');

  const fetchSchools = async () => {
    const { data } = await supabase.from('institutions').select('*').order('created_at', { ascending: false });
    setSchools((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchSchools(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('School name is required'); return; }
    setSaving(true);

    const { data, error } = await supabase.from('institutions').insert({
      name: name.trim(),
      city: city || null,
      region: region || null,
      email: email || null,
      phone: phone || null,
      selected_plan: plan,
      total_teacher_slots: parseInt(teacherSlots) || 10,
      total_student_slots: parseInt(studentSlots) || 50,
      created_by: user?.id,
    } as any).select().single();

    if (error) {
      toast.error('Failed to create school: ' + error.message);
    } else {
      toast.success('School created successfully');
      setCreateOpen(false);
      resetForm();
      fetchSchools();
    }
    setSaving(false);
  };

  const resetForm = () => {
    setName(''); setCity(''); setRegion(''); setEmail(''); setPhone('');
    setPlan('pro_institution'); setTeacherSlots('10'); setStudentSlots('50');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schools</h1>
          <p className="text-muted-foreground mt-1">Manage all institutions on the platform</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2"><Plus className="w-4 h-4" /> Create School</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New School</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>School Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Accra Academy" />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={plan} onValueChange={setPlan}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pro_institution">Pro Institution</SelectItem>
                    <SelectItem value="premium_institution">Premium Institution</SelectItem>
                  </SelectContent>
                </Select>
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
              <Button onClick={handleCreate} disabled={saving} variant="hero" className="w-full gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <School className="w-4 h-4" />}
                Create School
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : schools.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No schools yet. Create one to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Slots (T/S)</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{[s.city, s.region].filter(Boolean).join(', ') || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={s.selected_plan === 'premium_institution' ? 'default' : 'secondary'}>
                        {s.selected_plan === 'premium_institution' ? 'Premium' : 'Pro'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="w-3 h-3" /> {s.total_teacher_slots} / {s.total_student_slots}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.email || s.phone || '—'}</TableCell>
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

export default SASchools;
