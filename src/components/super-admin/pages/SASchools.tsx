import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { Plus, School, Loader2, Users, Search, MapPin, Building, Mail, Phone, Calendar, MoreHorizontal, Pencil, Trash2, Eye, Ban } from 'lucide-react';
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
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Counts for school detail
  const [schoolMemberCounts, setSchoolMemberCounts] = useState<{ teachers: number; students: number }>({ teachers: 0, students: 0 });

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editSchool, setEditSchool] = useState<InstitutionRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const [editTeacherSlots, setEditTeacherSlots] = useState('');
  const [editStudentSlots, setEditStudentSlots] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Delete / Suspend
  const [deleteSchool, setDeleteSchool] = useState<InstitutionRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [suspendSchool, setSuspendSchool] = useState<InstitutionRow | null>(null);
  const [suspending, setSuspending] = useState(false);

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
    const { error } = await supabase.from('institutions').insert({
      name: name.trim(), city: city || null, region: region || null,
      email: email || null, phone: phone || null, selected_plan: plan,
      total_teacher_slots: parseInt(teacherSlots) || 10,
      total_student_slots: parseInt(studentSlots) || 50,
      created_by: user?.id,
    } as any).select().single();
    if (error) { toast.error('Failed to create school: ' + error.message); }
    else { toast.success('School created successfully'); setCreateOpen(false); resetForm(); fetchSchools(); }
    setSaving(false);
  };

  const resetForm = () => {
    setName(''); setCity(''); setRegion(''); setEmail(''); setPhone('');
    setPlan('pro_institution'); setTeacherSlots('10'); setStudentSlots('50');
  };

  const regions = Array.from(new Set(schools.map(s => s.region).filter(Boolean))) as string[];
  const districts = Array.from(new Set(schools.map(s => s.city).filter(Boolean))) as string[];

  const filtered = schools.filter((s) => {
    const matchesSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = filterRegion === 'all' || s.region === filterRegion;
    const matchesPlan = filterPlan === 'all' || s.selected_plan === filterPlan;
    const matchesDistrict = filterDistrict === 'all' || s.city === filterDistrict;
    const matchesType = filterType === 'all' ||
      (filterType === 'private' && s.name.toLowerCase().includes('private')) ||
      (filterType === 'public' && !s.name.toLowerCase().includes('private'));
    return matchesSearch && matchesRegion && matchesPlan && matchesDistrict && matchesType;
  });

  const openSchoolDetail = async (school: InstitutionRow) => {
    setSelectedSchool(school);
    const { data: members } = await supabase
      .from('institution_members').select('member_role')
      .eq('institution_id', school.id).eq('is_active', true);
    const m = members || [];
    setSchoolMemberCounts({
      teachers: m.filter((mem: any) => mem.member_role === 'teacher').length,
      students: m.filter((mem: any) => mem.member_role === 'student').length,
    });
  };

  const openEdit = (school: InstitutionRow) => {
    setEditSchool(school);
    setEditName(school.name); setEditCity(school.city || ''); setEditRegion(school.region || '');
    setEditEmail(school.email || ''); setEditPhone(school.phone || '');
    setEditPlan(school.selected_plan); setEditTeacherSlots(String(school.total_teacher_slots));
    setEditStudentSlots(String(school.total_student_slots));
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editSchool || !editName.trim()) return;
    setEditSaving(true);
    const { error } = await supabase.from('institutions').update({
      name: editName.trim(), city: editCity || null, region: editRegion || null,
      email: editEmail || null, phone: editPhone || null, selected_plan: editPlan,
      total_teacher_slots: parseInt(editTeacherSlots) || 0,
      total_student_slots: parseInt(editStudentSlots) || 0,
    }).eq('id', editSchool.id);
    if (error) toast.error('Failed to update school');
    else { toast.success('School updated'); setEditOpen(false); fetchSchools(); }
    setEditSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteSchool) return;
    setDeleting(true);
    const { error } = await supabase.from('institutions').delete().eq('id', deleteSchool.id);
    if (error) toast.error('Failed to delete school: ' + error.message);
    else { toast.success('School deleted'); setDeleteSchool(null); fetchSchools(); }
    setDeleting(false);
  };

  const handleSuspend = async () => {
    if (!suspendSchool) return;
    setSuspending(true);
    // We mark subscriptions as suspended for this school
    const { error } = await supabase.from('school_subscriptions')
      .update({ status: 'suspended' } as any)
      .eq('institution_id', suspendSchool.id);
    if (error) toast.error('Failed to suspend school');
    else { toast.success(`${suspendSchool.name} has been suspended`); setSuspendSchool(null); }
    setSuspending(false);
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
            <DialogHeader><DialogTitle>Create New School</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>School Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Accra Academy" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
                <div className="space-y-2"><Label>Region</Label><Input value={region} onChange={(e) => setRegion(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
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
                <div className="space-y-2"><Label>Teacher Slots</Label><Input type="number" value={teacherSlots} onChange={(e) => setTeacherSlots(e.target.value)} /></div>
                <div className="space-y-2"><Label>Student Slots</Label><Input type="number" value={studentSlots} onChange={(e) => setStudentSlots(e.target.value)} /></div>
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
        <Select value={filterDistrict} onValueChange={setFilterDistrict}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Districts" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRegion} onValueChange={setFilterRegion}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Regions" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPlan} onValueChange={setFilterPlan}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Plans" /></SelectTrigger>
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
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
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
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openSchoolDetail(s)} className="gap-2">
                            <Eye className="w-4 h-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(s)} className="gap-2">
                            <Pencil className="w-4 h-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSuspendSchool(s)} className="gap-2 text-orange-600 focus:text-orange-600">
                            <Ban className="w-4 h-4" /> Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteSchool(s)} className="gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4" /> Delete
                          </DropdownMenuItem>
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

      {/* School Detail Dialog */}
      <Dialog open={!!selectedSchool} onOpenChange={(o) => !o && setSelectedSchool(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <School className="w-5 h-5 text-primary" /> {selectedSchool?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedSchool && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div><p className="text-xs text-muted-foreground">Location</p><p className="text-sm font-medium">{[selectedSchool.city, selectedSchool.region].filter(Boolean).join(', ') || 'Not specified'}</p></div>
                </div>
                <div className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div><p className="text-xs text-muted-foreground">Address</p><p className="text-sm font-medium">{selectedSchool.address || 'Not specified'}</p></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium">{selectedSchool.email || '—'}</p></div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{selectedSchool.phone || '—'}</p></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{selectedSchool.total_teacher_slots}</p><p className="text-xs text-muted-foreground">Teacher Slots</p><p className="text-xs text-primary font-medium mt-1">{schoolMemberCounts.teachers} active</p></CardContent></Card>
                <Card className="bg-muted/50"><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{selectedSchool.total_student_slots}</p><p className="text-xs text-muted-foreground">Student Slots</p><p className="text-xs text-primary font-medium mt-1">{schoolMemberCounts.students} active</p></CardContent></Card>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Plan</p><Badge variant={selectedSchool.selected_plan === 'premium_institution' ? 'default' : 'secondary'} className="mt-1">{selectedSchool.selected_plan === 'premium_institution' ? 'Premium Institution' : 'Pro Institution'}</Badge></div>
                <div><p className="text-xs text-muted-foreground">Billing Cycle</p><p className="text-sm font-medium capitalize mt-1">{selectedSchool.billing_cycle}</p></div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" />Created: {new Date(selectedSchool.created_at).toLocaleDateString()}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit School Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit School</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2"><Label>School Name *</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>City</Label><Input value={editCity} onChange={(e) => setEditCity(e.target.value)} /></div>
              <div className="space-y-2"><Label>Region</Label><Input value={editRegion} onChange={(e) => setEditRegion(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro_institution">Pro Institution</SelectItem>
                  <SelectItem value="premium_institution">Premium Institution</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Teacher Slots</Label><Input type="number" value={editTeacherSlots} onChange={(e) => setEditTeacherSlots(e.target.value)} /></div>
              <div className="space-y-2"><Label>Student Slots</Label><Input type="number" value={editStudentSlots} onChange={(e) => setEditStudentSlots(e.target.value)} /></div>
            </div>
            <Button onClick={handleEdit} disabled={editSaving} variant="hero" className="w-full gap-2">
              {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />} Update School
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSchool} onOpenChange={(o) => !o && setDeleteSchool(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Trash2 className="w-5 h-5 text-destructive" />Delete School</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to permanently delete <strong>{deleteSchool?.name}</strong>? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation */}
      <AlertDialog open={!!suspendSchool} onOpenChange={(o) => !o && setSuspendSchool(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Ban className="w-5 h-5 text-orange-600" />Suspend School</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to suspend <strong>{suspendSchool?.name}</strong>? Their subscriptions will be marked as suspended.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={suspending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspend} className="bg-orange-600 text-white hover:bg-orange-700" disabled={suspending}>
              {suspending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Suspend School'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SASchools;
