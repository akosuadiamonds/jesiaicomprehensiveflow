import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, Search, MoreHorizontal, Trash2, ArrowUpCircle, Eye, Pencil, Ban } from 'lucide-react';
import { toast } from 'sonner';

interface UserRow {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  user_role: string | null;
  school_name: string | null;
  selected_plan: string | null;
  created_at: string;
  phone_number: string | null;
  class_grade: string | null;
  gender: string | null;
}

const SAUsers: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // View details
  const [viewUser, setViewUser] = useState<UserRow | null>(null);

  // Edit
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Plan change
  const [planDialogUser, setPlanDialogUser] = useState<UserRow | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);

  // Delete
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Suspend
  const [suspendUser, setSuspendUser] = useState<UserRow | null>(null);
  const [suspendingUser, setSuspendingUser] = useState(false);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const districts = Array.from(new Set(users.map(u => u.school_name).filter(Boolean))) as string[];

  const filtered = users.filter((u) => {
    const matchesSearch = !search ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (u.school_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesTab = tab === 'all' || u.user_role === tab;
    const matchesDistrict = filterDistrict === 'all' || u.school_name === filterDistrict;
    const matchesType = filterType === 'all' ||
      (filterType === 'private' && (u.school_name || '').toLowerCase().includes('private')) ||
      (filterType === 'public' && !(u.school_name || '').toLowerCase().includes('private'));
    return matchesSearch && matchesTab && matchesDistrict && matchesType;
  });

  const roleBadge = (role: string | null) => {
    switch (role) {
      case 'teacher': return <Badge className="bg-blue-100 text-blue-700 border-0">Teacher</Badge>;
      case 'learner': return <Badge className="bg-purple-100 text-purple-700 border-0">Student</Badge>;
      case 'school_admin': return <Badge className="bg-orange-100 text-orange-700 border-0">School Admin</Badge>;
      case 'super_admin': return <Badge className="bg-red-100 text-red-700 border-0">Super Admin</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleChangePlan = async () => {
    if (!planDialogUser || !selectedPlan) return;
    setSavingPlan(true);
    const { error } = await supabase.from('profiles').update({ selected_plan: selectedPlan }).eq('user_id', planDialogUser.user_id);
    if (error) toast.error('Failed to update plan');
    else { toast.success(`Plan updated to ${selectedPlan} for ${planDialogUser.first_name}`); setPlanDialogUser(null); fetchUsers(); }
    setSavingPlan(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      const res = await supabase.functions.invoke('delete-user', { body: { user_id: deleteUser.user_id } });
      if (res.error) toast.error('Failed to delete user: ' + (res.error.message || 'Unknown error'));
      else { toast.success(`User ${deleteUser.first_name} ${deleteUser.last_name} deleted`); setDeleteUser(null); fetchUsers(); }
    } catch { toast.error('Failed to delete user'); }
    setDeleting(false);
  };

  const handleEditUser = async () => {
    if (!editUser) return;
    setEditSaving(true);
    const { error } = await supabase.from('profiles').update({
      first_name: editFirstName, last_name: editLastName,
      selected_plan: editPlan, user_role: editRole,
    }).eq('user_id', editUser.user_id);
    if (error) toast.error('Failed to update user');
    else { toast.success('User updated'); setEditUser(null); fetchUsers(); }
    setEditSaving(false);
  };

  const handleSuspendUser = async () => {
    if (!suspendUser) return;
    setSuspendingUser(true);
    const { error } = await supabase.from('profiles').update({ selected_plan: 'suspended' }).eq('user_id', suspendUser.user_id);
    if (error) toast.error('Failed to suspend user');
    else { toast.success(`${suspendUser.first_name} ${suspendUser.last_name} has been suspended`); setSuspendUser(null); fetchUsers(); }
    setSuspendingUser(false);
  };

  const openEdit = (user: UserRow) => {
    setEditFirstName(user.first_name || ''); setEditLastName(user.last_name || '');
    setEditPlan(user.selected_plan || 'free'); setEditRole(user.user_role || 'teacher');
    setEditUser(user);
  };

  const openPlanDialog = (user: UserRow) => {
    setSelectedPlan(user.selected_plan || 'free');
    setPlanDialogUser(user);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground mt-1">Manage all platform users</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({users.length})</TabsTrigger>
          <TabsTrigger value="teacher">Teachers ({users.filter(u => u.user_role === 'teacher').length})</TabsTrigger>
          <TabsTrigger value="learner">Students ({users.filter(u => u.user_role === 'learner').length})</TabsTrigger>
          <TabsTrigger value="school_admin">School Admins ({users.filter(u => u.user_role === 'school_admin').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.first_name} {u.last_name}</TableCell>
                    <TableCell>{roleBadge(u.user_role)}</TableCell>
                    <TableCell className="text-muted-foreground">{u.school_name || '—'}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{u.selected_plan || 'none'}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {u.user_role !== 'super_admin' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewUser(u)} className="gap-2">
                              <Eye className="w-4 h-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(u)} className="gap-2">
                              <Pencil className="w-4 h-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPlanDialog(u)} className="gap-2">
                              <ArrowUpCircle className="w-4 h-4" /> Change Plan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSuspendUser(u)} className="gap-2 text-orange-600 focus:text-orange-600">
                              <Ban className="w-4 h-4" /> Suspend
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteUser(u)} className="gap-2 text-destructive focus:text-destructive">
                              <Trash2 className="w-4 h-4" /> Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View User Details Dialog */}
      <Dialog open={!!viewUser} onOpenChange={(o) => !o && setViewUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>User Details</DialogTitle></DialogHeader>
          {viewUser && (
            <div className="space-y-3 mt-2">
              <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium">{viewUser.first_name} {viewUser.last_name}</p></div>
              <div><p className="text-xs text-muted-foreground">Role</p><div className="mt-1">{roleBadge(viewUser.user_role)}</div></div>
              <div><p className="text-xs text-muted-foreground">School</p><p className="text-sm font-medium">{viewUser.school_name || '—'}</p></div>
              <div><p className="text-xs text-muted-foreground">Plan</p><Badge variant="outline" className="capitalize mt-1">{viewUser.selected_plan || 'none'}</Badge></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{viewUser.phone_number || '—'}</p></div>
              <div><p className="text-xs text-muted-foreground">Class/Grade</p><p className="text-sm font-medium">{viewUser.class_grade || '—'}</p></div>
              <div><p className="text-xs text-muted-foreground">Gender</p><p className="text-sm font-medium capitalize">{viewUser.gender || '—'}</p></div>
              <div><p className="text-xs text-muted-foreground">Joined</p><p className="text-sm font-medium">{new Date(viewUser.created_at).toLocaleDateString()}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="learner">Student</SelectItem>
                  <SelectItem value="school_admin">School Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Select value={editPlan} onValueChange={setEditPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free Trial</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleEditUser} disabled={editSaving} variant="hero" className="w-full gap-2">
              {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />} Update User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={!!planDialogUser} onOpenChange={(o) => !o && setPlanDialogUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Change Plan</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">Changing plan for <strong>{planDialogUser?.first_name} {planDialogUser?.last_name}</strong></p>
            <p className="text-sm text-muted-foreground">Current plan: <Badge variant="outline" className="capitalize ml-1">{planDialogUser?.selected_plan || 'none'}</Badge></p>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free Trial</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleChangePlan} disabled={savingPlan || selectedPlan === (planDialogUser?.selected_plan || 'free')} variant="hero" className="w-full gap-2">
              {savingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpCircle className="w-4 h-4" />} Update Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={(o) => !o && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Trash2 className="w-5 h-5 text-destructive" />Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to permanently delete <strong>{deleteUser?.first_name} {deleteUser?.last_name}</strong>'s account? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation */}
      <AlertDialog open={!!suspendUser} onOpenChange={(o) => !o && setSuspendUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><Ban className="w-5 h-5 text-orange-600" />Suspend User</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to suspend <strong>{suspendUser?.first_name} {suspendUser?.last_name}</strong>? Their plan will be set to suspended.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={suspendingUser}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspendUser} className="bg-orange-600 text-white hover:bg-orange-700" disabled={suspendingUser}>
              {suspendingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Suspend User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SAUsers;
