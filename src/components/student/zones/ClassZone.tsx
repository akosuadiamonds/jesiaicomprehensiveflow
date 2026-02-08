import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  BookOpen,
  Search,
  Plus,
  Bell,
  Calendar,
  MessageSquare,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ClassroomData {
  id: string;
  name: string;
  subject: string;
  description: string | null;
  teacher_id: string;
  classroom_type: string;
  invite_code: string;
}

interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  created_at: string;
  classroom_id: string;
}

interface ResourceData {
  id: string;
  title: string;
  resource_type: string;
  content: any;
  created_at: string;
  classroom_id: string;
}

const ClassZone: React.FC = () => {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [myClasses, setMyClasses] = useState<ClassroomData[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassroomData | null>(null);

  useEffect(() => {
    if (user) fetchClassrooms();
  }, [user]);

  const fetchClassrooms = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Get joined classrooms
      const { data: enrollments } = await supabase
        .from('classroom_students')
        .select('classroom_id, approval_status')
        .eq('student_id', user.id)
        .eq('is_active', true);

      if (enrollments && enrollments.length > 0) {
        const approvedIds = enrollments
          .filter(e => e.approval_status === 'approved')
          .map(e => e.classroom_id);

        if (approvedIds.length > 0) {
          const { data: classrooms } = await supabase
            .from('classrooms')
            .select('*')
            .in('id', approvedIds);

          setMyClasses(classrooms || []);

          // Fetch announcements
          const { data: anns } = await supabase
            .from('classroom_announcements')
            .select('*')
            .in('classroom_id', approvedIds)
            .order('created_at', { ascending: false })
            .limit(10);
          setAnnouncements(anns || []);

          // Fetch resources
          const { data: res } = await supabase
            .from('classroom_resources')
            .select('*')
            .in('classroom_id', approvedIds)
            .eq('is_published', true)
            .order('created_at', { ascending: false });
          setResources(res || []);
        }
      }
    } catch (err) {
      console.error('Error fetching classrooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClass = async () => {
    if (!user || inviteCode.length < 4) {
      toast.error('Please enter a valid invite code');
      return;
    }

    const { data: classroom, error } = await supabase
      .from('classrooms')
      .select('id, name')
      .eq('invite_code', inviteCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !classroom) {
      toast.error('Invalid invite code');
      return;
    }

    const { data: existing } = await supabase
      .from('classroom_students')
      .select('id')
      .eq('classroom_id', classroom.id)
      .eq('student_id', user.id)
      .maybeSingle();

    if (existing) {
      toast.info("You're already in this class");
      setIsJoinDialogOpen(false);
      return;
    }

    const { error: joinError } = await supabase
      .from('classroom_students')
      .insert({ classroom_id: classroom.id, student_id: user.id });

    if (joinError) {
      toast.error('Failed to join class');
      return;
    }

    toast.success(`Joined ${classroom.name}! 🎉`);
    setInviteCode('');
    setIsJoinDialogOpen(false);
    fetchClassrooms();
  };

  const getClassAnnouncements = (classId: string) =>
    announcements.filter(a => a.classroom_id === classId);

  const getClassResources = (classId: string) =>
    resources.filter(r => r.classroom_id === classId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Class detail view
  if (selectedClass) {
    const classAnnouncements = getClassAnnouncements(selectedClass.id);
    const classResources = getClassResources(selectedClass.id);

    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => setSelectedClass(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-sm">Back to classes</span>
        </button>

        <div>
          <h2 className="text-2xl font-bold">{selectedClass.name}</h2>
          <p className="text-muted-foreground">{selectedClass.subject}</p>
          {selectedClass.description && (
            <p className="text-sm mt-2">{selectedClass.description}</p>
          )}
        </div>

        <Tabs defaultValue="resources">
          <TabsList>
            <TabsTrigger value="resources">Notes & Materials</TabsTrigger>
            <TabsTrigger value="announcements">
              Announcements
              {classAnnouncements.length > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">{classAnnouncements.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="mt-4 space-y-3">
            {classResources.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-muted-foreground">No materials shared yet</CardContent></Card>
            ) : (
              classResources.map((res) => (
                <Card key={res.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{res.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">{res.resource_type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(res.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="announcements" className="mt-4 space-y-3">
            {classAnnouncements.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-muted-foreground">No announcements yet</CardContent></Card>
            ) : (
              classAnnouncements.map((ann) => (
                <Card key={ann.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{ann.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(ann.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{ann.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Main view
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">🏫</span>
            Class Zone
          </h2>
          <p className="text-muted-foreground">Learn with your teachers and classmates</p>
        </div>
        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Join Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a Class</DialogTitle>
              <DialogDescription>Enter the invite code from your teacher</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Enter invite code (e.g., ABC123)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={10}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleJoinClass}>Join Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {myClasses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
            <p className="text-muted-foreground mb-4">
              Ask your teacher for an invite code to join a class
            </p>
            <Button onClick={() => setIsJoinDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Join Your First Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myClasses.map((cls) => {
            const classAnns = getClassAnnouncements(cls.id);
            return (
              <Card
                key={cls.id}
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedClass(cls)}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{cls.name}</h4>
                        {classAnns.length > 0 && (
                          <Badge variant="destructive" className="text-xs">{classAnns.length} new</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{cls.subject}</p>
                    </div>
                    <Badge variant={cls.classroom_type === 'school' ? 'secondary' : 'outline'}>
                      {cls.classroom_type === 'school' ? '🏫 School' : '📚 Private'}
                    </Badge>
                  </div>

                  <Button size="sm" className="w-full mt-2 gap-1 group-hover:bg-primary group-hover:text-primary-foreground" variant="outline">
                    <BookOpen className="w-4 h-4" />
                    View Class
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {announcements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Announcements
          </h3>
          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => {
              const cls = myClasses.find(c => c.id === ann.classroom_id);
              return (
                <Card key={ann.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{ann.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(ann.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{ann.content}</p>
                        {cls && <Badge variant="outline" className="mt-2 text-xs">{cls.name}</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassZone;
