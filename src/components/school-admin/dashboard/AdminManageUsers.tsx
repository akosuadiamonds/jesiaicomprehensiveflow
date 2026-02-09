import React, { useEffect, useState } from 'react';
import { useAdmin } from '../SchoolAdminApp';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserPlus, GraduationCap, Users, Shield, Trash2, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import AdminBulkUploadModal from './AdminBulkUploadModal';

interface Member {
  id: string;
  user_id: string;
  member_role: string;
  is_active: boolean;
  joined_at: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email?: string;
  };
}

const AdminManageUsers: React.FC = () => {
  const { institution, refreshInstitution } = useAdmin();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addRole, setAddRole] = useState<'teacher' | 'student' | 'admin'>('teacher');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [bulkUploadType, setBulkUploadType] = useState<'teacher' | 'student'>('teacher');

  const fetchMembers = async () => {
    if (!institution) return;
    setLoading(true);
    const { data } = await supabase
      .from('institution_members')
      .select('*')
      .eq('institution_id', institution.id)
      .order('joined_at', { ascending: false });

    if (data) {
      const memberList = data as any[];
      const userIds = memberList.map(m => m.user_id).filter(Boolean);
      
      let profiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds);
        profiles = (profileData as any[]) || [];
      }

      const enriched = memberList.map(m => ({
        ...m,
        profile: profiles.find(p => p.user_id === m.user_id) || null,
      }));

      setMembers(enriched);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [institution]);

  const handleAddUser = async () => {
    if (!institution || !user || !email.trim() || !firstName.trim() || !lastName.trim()) return;
    setIsAdding(true);

    try {
      // Check slot availability
      const currentTeachers = members.filter(m => m.member_role === 'teacher' && m.is_active).length;
      const currentStudents = members.filter(m => m.member_role === 'student' && m.is_active).length;

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

      // Check if user already exists by looking up profile by email or name
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('first_name', firstName.trim())
        .eq('last_name', lastName.trim())
        .maybeSingle();

      if (existingProfile) {
        // Add existing user to institution
        const { error: memberError } = await supabase.from('institution_members' as any).insert({
          institution_id: institution.id,
          user_id: (existingProfile as any).user_id,
          member_role: addRole,
          added_by: user.id,
        });
        if (memberError) {
          toast.error('This user may already be a member of the institution.');
          setIsAdding(false);
          return;
        }
      } else {
        // User doesn't exist yet — store as a pending invitation
        // For now, show a message that the user needs to sign up first
        toast.info(`An invitation will be sent to ${email.trim()}. The user needs to sign up and will be added upon registration.`);
      }

      toast.success(`${addRole.charAt(0).toUpperCase() + addRole.slice(1)} added successfully!`);
      setAddDialogOpen(false);
      setEmail('');
      setFirstName('');
      setLastName('');
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

    const currentTeachers = members.filter(m => m.member_role === 'teacher' && m.is_active).length;
    const currentStudents = members.filter(m => m.member_role === 'student' && m.is_active).length;

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

    toast.success(`${data.length} ${bulkUploadType}s uploaded to roster successfully!`);
    fetchMembers();
  };

  const handleRemoveMember = async (memberId: string) => {
    await supabase.from('institution_members' as any).update({ is_active: false }).eq('id', memberId);
    toast.success('User removed from institution');
    fetchMembers();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-primary/10 text-primary border-primary/20">Admin</Badge>;
      case 'teacher': return <Badge className="bg-accent/10 text-accent border-accent/20">Teacher</Badge>;
      case 'student': return <Badge className="bg-success/10 text-success border-success/20">Student</Badge>;
      default: return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const teachers = members.filter(m => m.member_role === 'teacher' && m.is_active);
  const students = members.filter(m => m.member_role === 'student' && m.is_active);
  const admins = members.filter(m => m.member_role === 'admin' && m.is_active);

  const renderMemberList = (list: Member[]) => (
    <div className="space-y-2">
      {list.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No users in this category yet</p>
      ) : (
        list.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">
                  {member.profile?.first_name?.[0]}{member.profile?.last_name?.[0]}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {member.profile?.first_name || 'Unknown'} {member.profile?.last_name || ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  Joined {new Date(member.joined_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getRoleBadge(member.member_role)}
              {member.user_id !== user?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))
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

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => handleBulkUpload('teacher')}>
              <Upload className="w-4 h-4" />
              Bulk Teachers
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => handleBulkUpload('student')}>
              <Upload className="w-4 h-4" />
              Bulk Students
            </Button>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add User
              </Button>
            </DialogTrigger>
          </div>
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
      </div>

      <Tabs defaultValue="teachers">
        <TabsList>
          <TabsTrigger value="teachers" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Teachers ({teachers.length})
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="w-4 h-4" />
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="admins" className="gap-2">
            <Shield className="w-4 h-4" />
            Admins ({admins.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="teachers">{renderMemberList(teachers)}</TabsContent>
        <TabsContent value="students">{renderMemberList(students)}</TabsContent>
        <TabsContent value="admins">{renderMemberList(admins)}</TabsContent>
      </Tabs>

      <AdminBulkUploadModal
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        uploadType={bulkUploadType}
        onConfirm={handleBulkConfirm}
      />
    </div>
  );
};

export default AdminManageUsers;
