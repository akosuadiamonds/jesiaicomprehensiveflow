import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users, BookOpen, Search, Plus, Bell, Calendar, Loader2, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useStudentClassrooms, StudentClassroom } from '@/hooks/useStudentClassrooms';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import StudentClassroomDetail from './StudentClassroomDetail';

const ClassZone: React.FC = () => {
  const { user } = useAuth();
  const { approvedClassrooms, pendingClassrooms, loading, refetch } = useStudentClassrooms();
  const [inviteCode, setInviteCode] = useState('');
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<StudentClassroom | null>(null);

  const handleJoinClass = async () => {
    if (inviteCode.length !== 6 || !user) {
      toast.error('Please enter a valid 6-character invite code');
      return;
    }

    setJoining(true);

    // Lookup classroom
    const { data: classroom, error } = await supabase
      .from('classrooms')
      .select('id, name, classroom_type')
      .eq('invite_code', inviteCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !classroom) {
      toast.error('Invalid invite code');
      setJoining(false);
      return;
    }

    // Check existing
    const { data: existing } = await supabase
      .from('classroom_students')
      .select('id')
      .eq('classroom_id', classroom.id)
      .eq('student_id', user.id)
      .maybeSingle();

    if (existing) {
      toast.info("You're already in this class");
      setJoining(false);
      setInviteCode('');
      setIsJoinDialogOpen(false);
      return;
    }

    const isPrivate = classroom.classroom_type === 'private';

    const { error: joinError } = await supabase
      .from('classroom_students')
      .insert({
        classroom_id: classroom.id,
        student_id: user.id,
        approval_status: isPrivate ? 'pending' : 'approved',
      });

    if (joinError) {
      toast.error('Failed to join class');
    } else if (isPrivate) {
      toast.success(`Request sent to join ${classroom.name}! ⏳`, {
        description: 'Waiting for teacher approval.',
      });
    } else {
      toast.success(`Joined ${classroom.name}! 🎉`);
    }

    setJoining(false);
    setInviteCode('');
    setIsJoinDialogOpen(false);
    refetch();
  };

  if (selectedClassroom) {
    return (
      <StudentClassroomDetail
        enrollment={selectedClassroom}
        onBack={() => { setSelectedClassroom(null); refetch(); }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🏫</span> Class Zone
          </h2>
          <p className="text-muted-foreground">Learn with your teachers and classmates</p>
        </div>
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Join Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a Class</DialogTitle>
              <DialogDescription>
                Enter the 6-character invite code from your teacher
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Enter invite code (e.g., ABC123)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleJoinClass} disabled={joining}>
                {joining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Join Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Pending Requests */}
          {pendingClassrooms.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" /> Pending Approval
              </h3>
              <div className="space-y-3">
                {pendingClassrooms.map((enrollment) => (
                  <Card key={enrollment.id} className="border-dashed border-amber-300 dark:border-amber-700">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">{enrollment.classroom.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.teacher_name} • {enrollment.classroom.subject}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        Awaiting Approval
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* My Classes */}
          <div>
            <h3 className="text-lg font-semibold mb-4">My Classes</h3>
            {approvedClassrooms.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No classes yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Join a class using your teacher's invite code to get started.
                  </p>
                  <Button onClick={() => setIsJoinDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> Join Your First Class
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvedClassrooms.map((enrollment) => (
                  <Card
                    key={enrollment.id}
                    className="hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => setSelectedClassroom(enrollment)}
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {enrollment.classroom.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">{enrollment.teacher_name}</p>
                        </div>
                        <Badge variant={enrollment.classroom.classroom_type === 'school' ? 'secondary' : 'outline'}>
                          {enrollment.classroom.classroom_type === 'school' ? '🏫 School' : '📚 Private'}
                        </Badge>
                      </div>

                      {enrollment.classroom.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {enrollment.classroom.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline">{enrollment.classroom.subject}</Badge>
                        <span className="text-xs">
                          Joined {new Date(enrollment.joined_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ClassZone;
