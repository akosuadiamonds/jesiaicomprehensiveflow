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
import { Plus, School, Loader2, Users, Search, MapPin, Building, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface InstitutionRow {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  selected_plan: string;
  total_teacher_slots: number;
  total_student_slots: number;
  billing_cycle: string;
  created_at: string;
}

const SASchools: React.FC = () => {
  const { user } = useAuth();
  const [schools, setSchools] = useState<InstitutionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<InstitutionRow | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');

  // Counts for school detail
  const [schoolMemberCounts, setSchoolMemberCounts] = useState<{ teachers: number; students: number }>({ teachers: 0, students: 0 });

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

  // Get unique regions for filter
  const regions = Array.from(new Set(schools.map(s => s.region).filter(Boolean))) as string[];

  // Filtered schools
  const filtered = schools.filter((s) => {
    const matchesSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = filterRegion === 'all' || s.region === filterRegion;
    const matchesPlan = filterPlan === 'all' || s.selected_plan === filterPlan;
    return matchesSearch && matchesRegion && matchesPlan;
  });

  const openSchoolDetail = async (school: InstitutionRow) => {
    setSelectedSchool(school);
    // Fetch member counts
    const { data: members } = await supabase
      .from('institution_members')
      .select('member_role')
      .eq('institution_id', school.id)
      .eq('is_active', true);
    const m = members || [];
    setSchoolMemberCounts({
      teachers: m.filter((mem: any) => mem.member_role === 'teacher').length,
      students: m.filter((mem: any) => mem.member_role === 'student').length,
    });
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search schools..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterRegion} onValueChange={setFilterRegion}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="pro_institution">Pro</SelectItem>
            <SelectItem value="premium_institution">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No schools found.</div>
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
                {filtered.map((s) => (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openSchoolDetail(s)}>
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

      {/* School Detail Dialog */}
      <Dialog open={!!selectedSchool} onOpenChange={(o) => !o && setSelectedSchool(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <School className="w-5 h-5 text-primary" />
              {selectedSchool?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedSchool && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">{[selectedSchool.city, selectedSchool.region].filter(Boolean).join(', ') || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium">{selectedSchool.address || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{selectedSchool.email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{selectedSchool.phone || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold">{selectedSchool.total_teacher_slots}</p>
                    <p className="text-xs text-muted-foreground">Teacher Slots</p>
                    <p className="text-xs text-primary font-medium mt-1">{schoolMemberCounts.teachers} active</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="p-3 text-center">
                    <p className="text-2xl font-bold">{selectedSchool.total_student_slots}</p>
                    <p className="text-xs text-muted-foreground">Student Slots</p>
                    <p className="text-xs text-primary font-medium mt-1">{schoolMemberCounts.students} active</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <Badge variant={selectedSchool.selected_plan === 'premium_institution' ? 'default' : 'secondary'} className="mt-1">
                    {selectedSchool.selected_plan === 'premium_institution' ? 'Premium Institution' : 'Pro Institution'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Billing Cycle</p>
                  <p className="text-sm font-medium capitalize mt-1">{selectedSchool.billing_cycle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Created: {new Date(selectedSchool.created_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SASchools;
