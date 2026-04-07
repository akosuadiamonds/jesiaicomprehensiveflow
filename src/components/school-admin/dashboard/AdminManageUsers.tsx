import React, { useEffect, useState } from 'react';
import { useAdmin } from '../SchoolAdminApp';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserPlus, GraduationCap, Users, Shield, Trash2, Loader2, Upload, Clock, MoreVertical, Pencil, Ban, Search, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import AdminBulkUploadModal from './AdminBulkUploadModal';

interface MemberProfile {
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  gender: string | null;
  school_name: string | null;
  class_grade: string | null;
  subjects: string[] | null;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  member_role: string;
  is_active: boolean;
  joined_at: string;
  profile?: MemberProfile;
}

interface PendingInvite {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  invited_role: string;
  date_of_birth: string | null;
  level_grade: string | null;
  subject: string | null;
  status: string;
  created_at: string;
}

const AdminManageUsers: React.FC = () => {
  const { institution } = useAdmin();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addRole, setAddRole] = useState<'teacher' | 'student' | 'admin'>('teacher');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [addSubject, setAddSubject] = useState('');
  const [addClass, setAddClass] = useState('');
  const [addGender, setAddGender] = useState('');
  const [addDateOfBirth, setAddDateOfBirth] = useState('');
  const [addParentContact, setAddParentContact] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [bulkUploadType, setBulkUploadType] = useState<'teacher' | 'student'>('teacher');
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: 'member' | 'invite' } | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMember, setViewMember] = useState<Member | null>(null);
  const [viewInvite, setViewInvite] = useState<PendingInvite | null>(null);

  const fetchMembers = async () => {
    if (!institution) return;
    setLoading(true);

    // Fetch active members + profiles
    const { data: memberData } = await supabase
      .from('institution_members')
      .select('*')
      .eq('institution_id', institution.id)
      .eq('is_active', true)
      .order('joined_at', { ascending: false });

    if (memberData) {
      const userIds = (memberData as any[]).map(m => m.user_id).filter(Boolean);
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, phone_number, gender, school_name, class_grade, subjects, created_at')
          .in('user_id', userIds);
        profiles = (profileData as any[]) || [];
      }
      setMembers((memberData as any[]).map(m => ({
        ...m,
        profile: profiles.find(p => p.user_id === m.user_id) || null,
      })));
    }

    // Fetch pending invites
    const { data: inviteData } = await supabase
      .from('pending_institution_invites' as any)
      .select('*')
      .eq('institution_id', institution.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    setPendingInvites((inviteData as any[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [institution]);

  const handleAddUser = async () => {
    if (!institution || !user || !email.trim() || !firstName.trim() || !lastName.trim()) return;
    setIsAdding(true);

    try {
      const currentTeachers = members.filter(m => m.member_role === 'teacher').length +
        pendingInvites.filter(i => i.invited_role === 'teacher').length;
      const currentStudents = members.filter(m => m.member_role === 'student').length +
        pendingInvites.filter(i => i.invited_role === 'student').length;

      if (addRole === 'teacher' && currentTeachers >= institution.total_teacher_slots) {
        toast.error('Teacher slot limit reached. Please upgrade your package.');
        setIsAdding(false);
        return;
      }
      if (addRole === 'student' && currentStudents >= institution.total_student_slots) {
        toast.error('Student slot limit reached. Please upgrade your package.');
        setIsAdding(false);
        return;
      }

      // Check if user already exists by profile lookup
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('first_name', firstName.trim())
        .eq('last_name', lastName.trim())
        .maybeSingle();

      if (existingProfile) {
        const { error: memberError } = await supabase.from('institution_members').insert({
          institution_id: institution.id,
          user_id: (existingProfile as any).user_id,
          member_role: addRole,
          added_by: user.id,
        });
        if (memberError) {
          toast.error('This user may already be a member.');
          setIsAdding(false);
          return;
        }
        toast.success(`${addRole.charAt(0).toUpperCase() + addRole.slice(1)} added successfully!`);
      } else {
        // Save as pending invite
        const { error: inviteError } = await supabase.from('pending_institution_invites' as any).insert({
          institution_id: institution.id,
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          invited_role: addRole,
          subject: addRole === 'teacher' ? addSubject || null : null,
          level_grade: addClass || null,
          date_of_birth: addRole === 'student' ? addDateOfBirth || null : null,
          invited_by: user.id,
        });
        if (inviteError) {
          console.error('Invite error:', inviteError);
          toast.error('Failed to add user.');
          setIsAdding(false);
          return;
        }
        toast.success(`${firstName.trim()} ${lastName.trim()} added as pending ${addRole}.`);
      }

      setAddDialogOpen(false);
      setEmail('');
      setFirstName('');
      setLastName('');
      setAddSubject('');
      setAddClass('');
      setAddGender('');
      setAddDateOfBirth('');
      setAddParentContact('');
      fetchMembers();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    }
    setIsAdding(false);
  };

  const handleBulkUpload = (uploadType: 'teacher' | 'student') => {
    setBulkUploadType(uploadType);
    setBulkUploadOpen(true);
  };

  const handleBulkConfirm = async (data: any[]) => {
    if (!institution || !user) return;

    const currentTeachers = members.filter(m => m.member_role === 'teacher').length +
      pendingInvites.filter(i => i.invited_role === 'teacher').length;
    const currentStudents = members.filter(m => m.member_role === 'student').length +
      pendingInvites.filter(i => i.invited_role === 'student').length;

    if (bulkUploadType === 'teacher') {
      const available = institution.total_teacher_slots - currentTeachers;
      if (data.length > available) {
        toast.error(`Only ${available} teacher slots available. You're trying to add ${data.length}.`);
        return;
      }
    } else {
      const available = institution.total_student_slots - currentStudents;
      if (data.length > available) {
        toast.error(`Only ${available} student slots available. You're trying to add ${data.length}.`);
        return;
      }
    }

    // Insert all as pending invites
    const invites = data.map((d: any) => {
      const nameParts = (d.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      return {
        institution_id: institution.id,
        email: d.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@pending`,
        first_name: firstName,
        last_name: lastName,
        invited_role: bulkUploadType,
        date_of_birth: d.dateOfBirth || null,
        level_grade: d.level || null,
        subject: d.subject || null,
        invited_by: user.id,
      };
    });

    const { error } = await supabase.from('pending_institution_invites' as any).insert(invites);
    if (error) {
      console.error('Bulk insert error:', error);
      toast.error('Failed to upload users.');
      return;
    }

    toast.success(`${data.length} ${bulkUploadType}s added successfully!`);
    setBulkUploadOpen(false);
    fetchMembers();
  };

  const handleRemoveMember = async (memberId: string) => {
    await supabase.from('institution_members').update({ is_active: false } as any).eq('id', memberId);
    toast.success('User removed');
    setDeleteTarget(null);
    fetchMembers();
  };

  const handleRemoveInvite = async (inviteId: string) => {
    await supabase.from('pending_institution_invites' as any).delete().eq('id', inviteId);
    toast.success('Pending invite removed');
    setDeleteTarget(null);
    fetchMembers();
  };

  const handleSuspendMember = async (memberId: string) => {
    await supabase.from('institution_members').update({ is_active: false } as any).eq('id', memberId);
    toast.success('User suspended');
    setSuspendTarget(null);
    fetchMembers();
  };

  const handleEditMember = async () => {
    if (!editMember || !editFirstName.trim() || !editLastName.trim()) return;
    setIsEditing(true);
    try {
      // Update profile
      if (editMember.profile) {
        await supabase
          .from('profiles')
          .update({ first_name: editFirstName.trim(), last_name: editLastName.trim() })
          .eq('user_id', editMember.user_id);
      }
      // Update role if changed
      if (editRole !== editMember.member_role) {
        await supabase
          .from('institution_members')
          .update({ member_role: editRole } as any)
          .eq('id', editMember.id);
      }
      toast.success('User updated');
      setEditMember(null);
      fetchMembers();
    } catch {
      toast.error('Failed to update user');
    }
    setIsEditing(false);
  };

  const openEditDialog = (member: Member) => {
    setEditMember(member);
    setEditFirstName(member.profile?.first_name || '');
    setEditLastName(member.profile?.last_name || '');
    setEditRole(member.member_role);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-primary/10 text-primary border-primary/20">Admin</Badge>;
      case 'teacher': return <Badge className="bg-accent/10 text-accent border-accent/20">Teacher</Badge>;
      case 'student': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Student</Badge>;
      default: return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const filterBySearch = (list: Member[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(m => {
      const name = `${m.profile?.first_name || ''} ${m.profile?.last_name || ''}`.toLowerCase();
      return name.includes(q);
    });
  };

  const filterInvitesBySearch = (list: PendingInvite[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(i => `${i.first_name} ${i.last_name}`.toLowerCase().includes(q) || i.email.toLowerCase().includes(q));
  };

  const teachers = filterBySearch(members.filter(m => m.member_role === 'teacher'));
  const students = filterBySearch(members.filter(m => m.member_role === 'student'));
  const admins = filterBySearch(members.filter(m => m.member_role === 'admin'));
  const pendingTeachers = filterInvitesBySearch(pendingInvites.filter(i => i.invited_role === 'teacher'));
  const pendingStudents = filterInvitesBySearch(pendingInvites.filter(i => i.invited_role === 'student'));

  const renderMemberList = (list: Member[], pendingList: PendingInvite[]) => (
    <div className="space-y-2">
      {list.length === 0 && pendingList.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No users in this category yet</p>
      ) : (
        <>
          {list.map((member) => {
            const memberName = `${member.profile?.first_name || 'Unknown'} ${member.profile?.last_name || ''}`.trim();
            return (
              <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {member.profile?.first_name?.[0]}{member.profile?.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{memberName}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleBadge(member.member_role)}
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setViewMember(member)}>
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Button>
                  {member.user_id !== user?.id && (
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="z-[100] bg-popover border shadow-md">
                        <DropdownMenuItem onClick={() => openEditDialog(member)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSuspendTarget({ id: member.id, name: memberName })}>
                          <Ban className="w-4 h-4 mr-2" /> Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget({ id: member.id, name: memberName, type: 'member' })}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
          {pendingList.map((invite) => (
            <div key={invite.id} className="flex items-center justify-between p-4 rounded-xl border border-dashed border-yellow-500/40 bg-yellow-50/30 dark:bg-yellow-900/10 hover:bg-yellow-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {invite.first_name} {invite.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {invite.email} · {invite.subject || invite.level_grade || 'Pending signup'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setViewInvite(invite)}>
                  <Eye className="w-3.5 h-3.5" />
                  View
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ id: invite.id, name: `${invite.first_name} ${invite.last_name}`, type: 'invite' })}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground mt-1">Add and manage your institution's users</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handleBulkUpload('teacher')}>
            <Upload className="w-4 h-4" />
            Bulk Teachers
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleBulkUpload('student')}>
            <Upload className="w-4 h-4" />
            Bulk Students
          </Button>
          <Button variant="hero" className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        </div>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'teacher' as const, label: 'Teacher', icon: GraduationCap },
                  { id: 'student' as const, label: 'Student', icon: Users },
                  { id: 'admin' as const, label: 'Admin', icon: Shield },
                ]).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setAddRole(r.id)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 text-sm transition-all ${
                      addRole === r.id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    <r.icon className="w-5 h-5" />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@school.edu.gh" />
            </div>

            {/* Class field for both teachers and students */}
            {(addRole === 'teacher' || addRole === 'student') && (
              <div className="space-y-2">
                <Label>Class / Grade</Label>
                <Select value={addClass} onValueChange={setAddClass}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic 1">Basic 1</SelectItem>
                    <SelectItem value="Basic 2">Basic 2</SelectItem>
                    <SelectItem value="Basic 3">Basic 3</SelectItem>
                    <SelectItem value="Basic 4">Basic 4</SelectItem>
                    <SelectItem value="Basic 5">Basic 5</SelectItem>
                    <SelectItem value="Basic 6">Basic 6</SelectItem>
                    <SelectItem value="JHS 1">JHS 1</SelectItem>
                    <SelectItem value="JHS 2">JHS 2</SelectItem>
                    <SelectItem value="JHS 3">JHS 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Subject field for teachers */}
            {addRole === 'teacher' && (
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={addSubject} onValueChange={setAddSubject}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Social Studies">Social Studies</SelectItem>
                    <SelectItem value="ICT">ICT</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Creative Arts">Creative Arts</SelectItem>
                    <SelectItem value="RME">RME</SelectItem>
                    <SelectItem value="Ghanaian Language">Ghanaian Language</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Extra student fields */}
            {addRole === 'student' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" value={addDateOfBirth} onChange={(e) => setAddDateOfBirth(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={addGender} onValueChange={setAddGender}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Parent/Guardian Contact</Label>
                  <Input value={addParentContact} onChange={(e) => setAddParentContact(e.target.value)} placeholder="0XX XXX XXXX" />
                </div>
              </>
            )}

            <Button
              onClick={handleAddUser}
              disabled={isAdding || !email.trim() || !firstName.trim() || !lastName.trim()}
              className="w-full"
              variant="hero"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="teachers">
        <TabsList>
          <TabsTrigger value="teachers" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Teachers ({teachers.length + pendingTeachers.length})
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="w-4 h-4" />
            Students ({students.length + pendingStudents.length})
          </TabsTrigger>
          <TabsTrigger value="admins" className="gap-2">
            <Shield className="w-4 h-4" />
            Admins ({admins.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="teachers">{renderMemberList(teachers, pendingTeachers)}</TabsContent>
        <TabsContent value="students">{renderMemberList(students, pendingStudents)}</TabsContent>
        <TabsContent value="admins">{renderMemberList(admins, [])}</TabsContent>
      </Tabs>

      <AdminBulkUploadModal
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        uploadType={bulkUploadType}
        onConfirm={handleBulkConfirm}
      />

      {/* Edit Dialog */}
      <Dialog open={!!editMember} onOpenChange={(open) => !open && setEditMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['teacher', 'student', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setEditRole(r)}
                    className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      editRole === r ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'
                    }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleEditMember} disabled={isEditing} className="w-full" variant="hero">
              {isEditing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the user from your institution. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget?.type === 'invite' ? handleRemoveInvite(deleteTarget.id) : handleRemoveMember(deleteTarget!.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Suspend Confirmation */}
      <AlertDialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend {suspendTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the user's access to your institution. You can re-add them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => suspendTarget && handleSuspendMember(suspendTarget.id)}>
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View User Details Modal */}
      <Dialog open={!!viewMember} onOpenChange={(open) => !open && setViewMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewMember && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {viewMember.profile?.first_name?.[0]}{viewMember.profile?.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {viewMember.profile?.first_name || 'Unknown'} {viewMember.profile?.last_name || ''}
                  </p>
                  {getRoleBadge(viewMember.member_role)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-0.5">Gender</p>
                  <p className="font-medium text-foreground">{viewMember.profile?.gender || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-0.5">Phone</p>
                  <p className="font-medium text-foreground">{viewMember.profile?.phone_number || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-0.5">School</p>
                  <p className="font-medium text-foreground">{viewMember.profile?.school_name || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-0.5">Class / Grade</p>
                  <p className="font-medium text-foreground">{viewMember.profile?.class_grade || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                  <p className="text-muted-foreground mb-0.5">Subjects</p>
                  <p className="font-medium text-foreground">
                    {viewMember.profile?.subjects && viewMember.profile.subjects.length > 0
                      ? viewMember.profile.subjects.join(', ')
                      : '—'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-0.5">Joined Institution</p>
                  <p className="font-medium text-foreground">{new Date(viewMember.joined_at).toLocaleDateString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-0.5">Account Created</p>
                  <p className="font-medium text-foreground">
                    {viewMember.profile?.created_at ? new Date(viewMember.profile.created_at).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewInvite} onOpenChange={(open) => !open && setViewInvite(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pending User Details</DialogTitle>
          </DialogHeader>
          {viewInvite && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg font-bold text-muted-foreground">
                    {viewInvite.first_name?.[0]}{viewInvite.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {viewInvite.first_name} {viewInvite.last_name}
                  </p>
                  <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                  <p className="text-muted-foreground mb-0.5">Email</p>
                  <p className="font-medium text-foreground">{viewInvite.email}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-0.5">Role</p>
                  <p className="font-medium text-foreground capitalize">{viewInvite.invited_role}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-0.5">Status</p>
                  <p className="font-medium text-foreground capitalize">{viewInvite.status}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-0.5">Class / Grade</p>
                  <p className="font-medium text-foreground">{viewInvite.level_grade || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground mb-0.5">Subject</p>
                  <p className="font-medium text-foreground">{viewInvite.subject || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                  <p className="text-muted-foreground mb-0.5">Date Added</p>
                  <p className="font-medium text-foreground">{new Date(viewInvite.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManageUsers;
