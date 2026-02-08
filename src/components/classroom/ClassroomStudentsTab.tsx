import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Upload, Copy, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import BulkStudentUploadModal from './BulkStudentUploadModal';

interface StudentRecord {
  id: string;
  student_id: string;
  joined_at: string;
  is_active: boolean;
  subscription_status: string | null;
  approval_status: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface ClassroomStudentsTabProps {
  classroomId: string;
  inviteCode: string;
  maxStudents: number;
}

const ClassroomStudentsTab: React.FC<ClassroomStudentsTabProps> = ({ classroomId, inviteCode, maxStudents }) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [classroomId]);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('classroom_students')
      .select('id, student_id, joined_at, is_active, subscription_status, approval_status')
      .eq('classroom_id', classroomId)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } else {
      // Fetch profiles for each student
      const studentIds = (data || []).map(s => s.student_id);
      let profileMap: Record<string, { first_name: string | null; last_name: string | null }> = {};

      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', studentIds);
        if (profiles) {
          profiles.forEach(p => { profileMap[p.user_id] = { first_name: p.first_name, last_name: p.last_name }; });
        }
      }

      setStudents((data || []).map(s => ({
        ...s,
        profile: profileMap[s.student_id],
      })));
    }
    setLoading(false);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    sonnerToast.success('Invite code copied!');
  };

  const removeStudent = async (enrollmentId: string) => {
    const { error } = await supabase
      .from('classroom_students')
      .delete()
      .eq('id', enrollmentId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to remove student', variant: 'destructive' });
    } else {
      sonnerToast.success('Student removed');
      fetchStudents();
    }
  };

  const approveStudent = async (enrollmentId: string) => {
    setApproving(enrollmentId);
    const { error } = await supabase
      .from('classroom_students')
      .update({ approval_status: 'approved' })
      .eq('id', enrollmentId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to approve student', variant: 'destructive' });
    } else {
      sonnerToast.success('Student approved!');
      fetchStudents();
    }
    setApproving(null);
  };

  const rejectStudent = async (enrollmentId: string) => {
    const { error } = await supabase
      .from('classroom_students')
      .delete()
      .eq('id', enrollmentId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to reject student', variant: 'destructive' });
    } else {
      sonnerToast.success('Request rejected');
      fetchStudents();
    }
  };

  const activeStudents = students.filter(s => s.is_active && s.approval_status === 'approved');
  const pendingStudents = students.filter(s => s.approval_status === 'pending');

  return (
    <div className="space-y-4">
      {/* Pending Approval Requests */}
      {pendingStudents.length > 0 && (
        <Card className="border-amber-300 dark:border-amber-700">
          <CardHeader>
            <CardTitle className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
              ⏳ Pending Requests ({pendingStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 border border-dashed rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm font-medium text-amber-600">
                    {(student.profile?.first_name?.[0] || 'S').toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {student.profile?.first_name || 'Student'} {student.profile?.last_name || ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested {new Date(student.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 gap-1"
                    onClick={() => approveStudent(student.id)}
                    disabled={approving === student.id}
                  >
                    {approving === student.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 gap-1"
                    onClick={() => rejectStudent(student.id)}
                  >
                    <XCircle className="w-3 h-3" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Students ({activeStudents.length} / {maxStudents})</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyInviteCode}>
              <Copy className="w-4 h-4 mr-2" /> Share Code
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowBulkModal(true)}>
              <Upload className="w-4 h-4 mr-2" /> Upload Students
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeStudents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No students yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                Share your invite code <span className="font-mono font-bold">{inviteCode}</span> with students or upload a student list.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={copyInviteCode}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Invite Code
                </Button>
                <Button onClick={() => setShowBulkModal(true)}>
                  <Upload className="mr-2 h-4 w-4" /> Upload Students
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Name</div>
                <div className="col-span-3">Joined</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {activeStudents.map((student, index) => (
                <div key={student.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="col-span-1 text-sm text-muted-foreground">{index + 1}</div>
                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {(student.profile?.first_name?.[0] || 'S').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {student.profile?.first_name || 'Student'} {student.profile?.last_name || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-muted-foreground">
                    {new Date(student.joined_at).toLocaleDateString()}
                  </div>
                  <div className="col-span-2">
                    <Badge variant={student.is_active ? 'default' : 'secondary'} className="text-xs">
                      {student.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeStudent(student.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BulkStudentUploadModal
        open={showBulkModal}
        onOpenChange={setShowBulkModal}
        inviteCode={inviteCode}
      />
    </div>
  );
};

export default ClassroomStudentsTab;
