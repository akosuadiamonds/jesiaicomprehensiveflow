import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  MessageSquare,
  Loader2,
  ChevronRight,
  Lock,
  PlayCircle,
  FileText,
  ClipboardList,
  CheckCircle2,
  Heart,
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
  monthly_fee: number | null;
  currency: string | null;
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
  is_published: boolean | null;
}

// Sample classes shown when user has no real classes yet
const sampleClasses: ClassroomData[] = [
  {
    id: 'sample-1',
    name: 'Mathematics Excellence',
    subject: 'Mathematics',
    description: 'Master algebra, geometry and problem-solving with Mr. Mensah',
    teacher_id: '',
    classroom_type: 'school',
    invite_code: 'MTH123',
    monthly_fee: null,
    currency: null,
  },
  {
    id: 'sample-2',
    name: 'BECE Science Prep',
    subject: 'Science',
    description: 'Comprehensive BECE science preparation with practicals and theory',
    teacher_id: '',
    classroom_type: 'private',
    invite_code: 'SCI456',
    monthly_fee: 50,
    currency: 'GHS',
  },
];

const sampleAnnouncements: AnnouncementData[] = [
  {
    id: 'sample-ann-1',
    title: 'Welcome to the class! 🎉',
    content: 'Please review the syllabus and come prepared for our first lesson on Monday.',
    created_at: new Date().toISOString(),
    classroom_id: 'sample-1',
  },
  {
    id: 'sample-ann-2',
    title: 'Upcoming Mock Exam',
    content: 'We will have a practice mock exam next Friday. Study chapters 1-5.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    classroom_id: 'sample-2',
  },
];

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Great', type: 'positive' as const },
  { emoji: '🙂', label: 'Good', type: 'positive' as const },
  { emoji: '😐', label: 'Okay', type: 'positive' as const },
  { emoji: '😕', label: 'Confusing', type: 'negative' as const },
  { emoji: '😞', label: 'Tough', type: 'negative' as const },
];

const SUPPORT_OPTIONS = [
  { emoji: '📖', label: 'Review lesson notes', description: 'Go over what was taught in class' },
  { emoji: '🤖', label: 'Chat with Jesi AI', description: 'Get help from your AI tutor' },
  { emoji: '📝', label: 'Try practice questions', description: 'Practice at your own pace' },
  { emoji: '🎥', label: 'Watch video explanations', description: 'Learn through videos' },
];

const ClassZone: React.FC = () => {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [myClasses, setMyClasses] = useState<ClassroomData[]>([]);
  const [pendingClasses, setPendingClasses] = useState<string[]>([]);
  const [browseClasses, setBrowseClasses] = useState<ClassroomData[]>([]);
  const [browseSearch, setBrowseSearch] = useState('');
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [resources, setResources] = useState<ResourceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBrowseLoading, setIsBrowseLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassroomData | null>(null);
  const [mainTab, setMainTab] = useState('my-classes');
  const [usingSamples, setUsingSamples] = useState(false);

  // Check-in state
  const [showCheckIn, setShowCheckIn] = useState(true);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Lesson note read tracking per class (localStorage)
  const [readNotes, setReadNotes] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (user) {
      fetchClassrooms();
      // Load read notes from localStorage
      const saved = localStorage.getItem(`jesi_read_notes_${user.id}`);
      if (saved) setReadNotes(JSON.parse(saved));
      // Check if already checked in today
      const lastCheckIn = localStorage.getItem(`jesi_checkin_${user.id}`);
      if (lastCheckIn === new Date().toDateString()) {
        setShowCheckIn(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (mainTab === 'browse' && browseClasses.length === 0) {
      fetchBrowseClasses();
    }
  }, [mainTab]);

  const markNoteAsRead = (classId: string, resourceId: string) => {
    if (!user) return;
    const updated = { ...readNotes };
    if (!updated[classId]) updated[classId] = [];
    if (!updated[classId].includes(resourceId)) {
      updated[classId] = [...updated[classId], resourceId];
    }
    setReadNotes(updated);
    localStorage.setItem(`jesi_read_notes_${user.id}`, JSON.stringify(updated));
    toast.success('Lesson note marked as read ✅');
  };

  const areAllNotesRead = (classId: string) => {
    const lessonNotes = resources.filter(
      r => r.classroom_id === classId && r.resource_type === 'lesson_plan'
    );
    if (lessonNotes.length === 0) return true;
    const read = readNotes[classId] || [];
    return lessonNotes.every(n => read.includes(n.id));
  };

  const handleMoodSelect = (mood: typeof MOOD_OPTIONS[0]) => {
    setSelectedMood(mood.label);
    if (!user) return;
    localStorage.setItem(`jesi_checkin_${user.id}`, new Date().toDateString());

    if (mood.type === 'negative') {
      setShowSupportDialog(true);
    } else {
      toast.success(`Thanks for sharing! Let's keep going 💪`);
      setShowCheckIn(false);
    }
  };

  const handleSupportSelect = (option: typeof SUPPORT_OPTIONS[0]) => {
    setShowSupportDialog(false);
    setShowCheckIn(false);
    toast.success(`${option.emoji} ${option.label} — you've got this! 💙`);
  };

  const fetchClassrooms = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: enrollments } = await supabase
        .from('classroom_students')
        .select('classroom_id, approval_status')
        .eq('student_id', user.id)
        .eq('is_active', true);

      const pendingIds: string[] = [];
      const approvedIds: string[] = [];

      if (enrollments) {
        enrollments.forEach(e => {
          if (e.approval_status === 'pending') pendingIds.push(e.classroom_id);
          if (e.approval_status === 'approved') approvedIds.push(e.classroom_id);
        });
      }

      setPendingClasses(pendingIds);

      if (approvedIds.length > 0) {
        const { data: classrooms } = await supabase
          .from('classrooms')
          .select('*')
          .in('id', approvedIds);
        setMyClasses(classrooms || []);
        setUsingSamples(false);

        const { data: anns } = await supabase
          .from('classroom_announcements')
          .select('*')
          .in('classroom_id', approvedIds)
          .order('created_at', { ascending: false })
          .limit(10);
        setAnnouncements(anns || []);

        const { data: res } = await supabase
          .from('classroom_resources')
          .select('*')
          .in('classroom_id', approvedIds)
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        setResources(res || []);
      } else {
        setMyClasses(sampleClasses);
        setAnnouncements(sampleAnnouncements);
        setUsingSamples(true);
      }
    } catch (err) {
      console.error('Error fetching classrooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrowseClasses = async () => {
    setIsBrowseLoading(true);
    try {
      const { data } = await supabase
        .from('classrooms')
        .select('*')
        .eq('classroom_type', 'private')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setBrowseClasses(data || []);
    } catch (err) {
      console.error('Error browsing classes:', err);
    } finally {
      setIsBrowseLoading(false);
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

    await joinClassroom(classroom.id, classroom.name);
    setInviteCode('');
    setIsJoinDialogOpen(false);
  };

  const joinClassroom = async (classroomId: string, classroomName: string) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('classroom_students')
      .select('id')
      .eq('classroom_id', classroomId)
      .eq('student_id', user.id)
      .maybeSingle();

    if (existing) {
      toast.info("You've already requested or joined this class");
      return;
    }

    const { error: joinError } = await supabase
      .from('classroom_students')
      .insert({ classroom_id: classroomId, student_id: user.id });

    if (joinError) {
      toast.error('Failed to join class');
      return;
    }

    toast.success(`Request sent to join ${classroomName}! ⏳`);
    setPendingClasses(prev => [...prev, classroomId]);
    fetchClassrooms();
  };

  const isAlreadyJoinedOrPending = (classroomId: string) => {
    return (!usingSamples && myClasses.some(c => c.id === classroomId)) || pendingClasses.includes(classroomId);
  };

  const getClassAnnouncements = (classId: string) =>
    announcements.filter(a => a.classroom_id === classId);

  const getClassResources = (classId: string) =>
    resources.filter(r => r.classroom_id === classId);

  const filteredBrowseClasses = browseClasses.filter(cls =>
    cls.name.toLowerCase().includes(browseSearch.toLowerCase()) ||
    cls.subject.toLowerCase().includes(browseSearch.toLowerCase()) ||
    (cls.description || '').toLowerCase().includes(browseSearch.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // ─── Check-in Screen ───
  if (showCheckIn) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">How was class today? 🎒</h2>
          <p className="text-muted-foreground">Let us know how you're feeling</p>
        </div>

        <div className="grid grid-cols-5 gap-3 max-w-lg w-full mb-8">
          {MOOD_OPTIONS.map((mood) => (
            <Card
              key={mood.label}
              className={`cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 ${
                selectedMood === mood.label ? 'border-primary bg-primary/5' : 'border-transparent'
              }`}
              onClick={() => handleMoodSelect(mood)}
            >
              <CardContent className="p-4 flex flex-col items-center gap-2">
                <span className="text-4xl">{mood.emoji}</span>
                <span className="text-xs font-medium text-center">{mood.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => {
            setShowCheckIn(false);
            if (user) localStorage.setItem(`jesi_checkin_${user.id}`, new Date().toDateString());
          }}
        >
          Skip for now
        </Button>

        {/* Support Dialog for Confusing / Tough */}
        <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                We're here for you 💙
              </DialogTitle>
              <DialogDescription>
                {selectedMood === 'Tough'
                  ? "It's okay to have tough days. You're braver than you think! Let's find a way to help."
                  : "Feeling confused is totally normal — it means you're learning something new! Let's clear things up."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <p className="text-sm font-medium text-muted-foreground">What kind of support do you need?</p>
              {SUPPORT_OPTIONS.map((option) => (
                <Card
                  key={option.label}
                  className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                  onClick={() => handleSupportSelect(option)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <div>
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowSupportDialog(false);
                  setShowCheckIn(false);
                  if (user) localStorage.setItem(`jesi_checkin_${user.id}`, new Date().toDateString());
                }}
              >
                I'm okay, continue to classes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── Class Detail View (real classes) ───
  if (selectedClass && !selectedClass.id.startsWith('sample-')) {
    const classAnnouncements = getClassAnnouncements(selectedClass.id);
    const classResources = getClassResources(selectedClass.id);
    const lessonNotes = classResources.filter(r => r.resource_type === 'lesson_plan');
    const practiceHomework = classResources.filter(r => ['test', 'quiz'].includes(r.resource_type));
    const videoResources = classResources.filter(r => r.resource_type === 'material');
    const notesComplete = areAllNotesRead(selectedClass.id);
    const readList = readNotes[selectedClass.id] || [];

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

        <Tabs defaultValue="notes">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notes" className="gap-1">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Lesson Notes</span>
              <span className="sm:hidden">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="gap-1">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Practice</span>
              <span className="sm:hidden">Practice</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-1">
              <PlayCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Videos</span>
              <span className="sm:hidden">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="gap-1">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Updates</span>
              <span className="sm:hidden">Updates</span>
              {classAnnouncements.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs h-5 w-5 p-0 flex items-center justify-center">
                  {classAnnouncements.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Lesson Notes Tab */}
          <TabsContent value="notes" className="mt-4 space-y-3">
            {lessonNotes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No lesson notes yet</p>
                  <p className="text-sm">Your teacher will share lesson notes here</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {readList.length}/{lessonNotes.length} completed
                  </p>
                  {notesComplete && (
                    <Badge className="bg-green-500 text-white gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      All Done
                    </Badge>
                  )}
                </div>
                {lessonNotes.map((note) => {
                  const isRead = readList.includes(note.id);
                  return (
                    <Card key={note.id} className={`transition-all ${isRead ? 'border-green-400/50 bg-green-50/30 dark:bg-green-900/10' : 'hover:shadow-md'}`}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isRead ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary/10'}`}>
                          {isRead ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{note.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {!isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markNoteAsRead(selectedClass.id, note.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </TabsContent>

          {/* Practice Homework Tab */}
          <TabsContent value="practice" className="mt-4 space-y-3">
            {!notesComplete && lessonNotes.length > 0 && (
              <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-sm">Complete lesson notes first</p>
                    <p className="text-xs text-muted-foreground">
                      Read all {lessonNotes.length} lesson note{lessonNotes.length > 1 ? 's' : ''} to unlock practice homework
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {practiceHomework.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No practice homework yet</p>
                  <p className="text-sm">Your teacher will assign quizzes and tests here</p>
                </CardContent>
              </Card>
            ) : (
              practiceHomework.map((hw) => {
                const locked = !notesComplete && lessonNotes.length > 0;
                return (
                  <Card key={hw.id} className={`transition-all ${locked ? 'opacity-50 pointer-events-none' : 'hover:shadow-md'}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {locked ? (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ClipboardList className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{hw.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">{hw.resource_type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(hw.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {locked && <Lock className="w-4 h-4 text-amber-500" />}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Video Resources Tab */}
          <TabsContent value="videos" className="mt-4 space-y-3">
            {videoResources.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <PlayCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No video resources yet</p>
                  <p className="text-sm">Your teacher will share video materials here</p>
                </CardContent>
              </Card>
            ) : (
              videoResources.map((vid) => (
                <Card key={vid.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{vid.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(vid.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="mt-4 space-y-3">
            {classAnnouncements.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No announcements yet</p>
                  <p className="text-sm">Your teacher will post updates here</p>
                </CardContent>
              </Card>
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

  // ─── Sample Class Detail View ───
  if (selectedClass && selectedClass.id.startsWith('sample-')) {
    const classAnns = getClassAnnouncements(selectedClass.id);
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => setSelectedClass(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-sm">Back to classes</span>
        </button>

        <div className="relative">
          <Badge variant="outline" className="absolute -top-1 right-0 text-xs text-muted-foreground">Sample Preview</Badge>
          <h2 className="text-2xl font-bold">{selectedClass.name}</h2>
          <p className="text-muted-foreground">{selectedClass.subject}</p>
          {selectedClass.description && (
            <p className="text-sm mt-2">{selectedClass.description}</p>
          )}
        </div>

        <Tabs defaultValue="notes">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="announcements">
              Updates
              {classAnns.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">{classAnns.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-4">
            <Card><CardContent className="p-6 text-center text-muted-foreground">No lesson notes yet — your teacher will add notes here</CardContent></Card>
          </TabsContent>

          <TabsContent value="practice" className="mt-4">
            <Card><CardContent className="p-6 text-center text-muted-foreground">No practice homework yet</CardContent></Card>
          </TabsContent>

          <TabsContent value="videos" className="mt-4">
            <Card><CardContent className="p-6 text-center text-muted-foreground">No video resources yet</CardContent></Card>
          </TabsContent>

          <TabsContent value="announcements" className="mt-4 space-y-3">
            {classAnns.map((ann) => (
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
            ))}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // ─── Main View ───
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
              Join with Code
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

      {usingSamples && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-start gap-3">
            <span className="text-xl">👋</span>
            <div>
              <p className="text-sm font-medium">These are sample classes to show you how it works</p>
              <p className="text-xs text-muted-foreground">Join a real class using an invite code or browse private classes below</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-classes">My Classes</TabsTrigger>
          <TabsTrigger value="browse">Browse Private Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="my-classes" className="mt-6 space-y-6">
          {pendingClasses.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">⏳ Pending Approval</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingClasses.map((id) => {
                  const cls = browseClasses.find(c => c.id === id);
                  return (
                    <Card key={id} className="border-dashed border-amber-300 dark:border-amber-700 opacity-75">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Lock className="w-5 h-5 text-amber-500" />
                        <div>
                          <p className="font-medium text-sm">{cls?.name || 'Class'}</p>
                          <p className="text-xs text-muted-foreground">Waiting for teacher approval</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

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
                        {cls.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cls.description}</p>
                        )}
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
        </TabsContent>

        <TabsContent value="browse" className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search private classes by name, subject..."
              className="pl-10"
              value={browseSearch}
              onChange={(e) => setBrowseSearch(e.target.value)}
            />
          </div>

          {isBrowseLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredBrowseClasses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <div className="text-4xl mb-3">🔍</div>
                <p>No private classes found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {filteredBrowseClasses.map((cls) => {
                const joined = isAlreadyJoinedOrPending(cls.id);
                const isPending = pendingClasses.includes(cls.id);
                return (
                  <Card key={cls.id} className={`transition-all ${joined ? 'border-green-400/50 bg-green-50/50 dark:bg-green-900/10' : 'hover:shadow-md'}`}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium truncate">{cls.name}</h4>
                          <p className="text-sm text-muted-foreground">{cls.subject}</p>
                          {cls.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{cls.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">📚 Private</Badge>
                            {cls.monthly_fee && cls.monthly_fee > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {cls.currency || 'GHS'} {cls.monthly_fee}/mo
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {isPending ? (
                        <Badge className="bg-amber-500 shrink-0">Pending ⏳</Badge>
                      ) : (!usingSamples && myClasses.some(c => c.id === cls.id)) ? (
                        <Badge className="bg-green-500 shrink-0">Joined ✓</Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="shrink-0"
                          onClick={() => joinClassroom(cls.id, cls.name)}
                        >
                          Request to Join
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassZone;
