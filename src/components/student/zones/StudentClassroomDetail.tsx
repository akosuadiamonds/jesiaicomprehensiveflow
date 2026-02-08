import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, BookOpen, FileText, Bell, ClipboardList, Video,
  School, Briefcase, Users, Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StudentClassroom } from '@/hooks/useStudentClassrooms';

interface Props {
  enrollment: StudentClassroom;
  onBack: () => void;
}

interface Resource {
  id: string;
  title: string;
  resource_type: string;
  content: any;
  is_published: boolean;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean | null;
  created_at: string;
}

const StudentClassroomDetail: React.FC<Props> = ({ enrollment, onBack }) => {
  const { classroom, teacher_name } = enrollment;
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const isPrivate = classroom.classroom_type === 'private';

  useEffect(() => {
    fetchData();
  }, [classroom.id]);

  const fetchData = async () => {
    setLoading(true);
    const [resResult, annResult] = await Promise.all([
      supabase
        .from('classroom_resources')
        .select('id, title, resource_type, content, is_published, created_at')
        .eq('classroom_id', classroom.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('classroom_announcements')
        .select('id, title, content, is_pinned, created_at')
        .eq('classroom_id', classroom.id)
        .order('created_at', { ascending: false }),
    ]);

    setResources((resResult.data as unknown as Resource[]) || []);
    setAnnouncements((annResult.data as unknown as Announcement[]) || []);
    setLoading(false);
  };

  const notes = resources.filter(r => ['lesson_plan', 'material'].includes(r.resource_type));
  const quizzes = resources.filter(r => ['test', 'quiz'].includes(r.resource_type));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isPrivate ? 'bg-primary/10' : 'bg-secondary'
            }`}>
              {isPrivate ? <Briefcase className="w-5 h-5 text-primary" /> : <School className="w-5 h-5 text-foreground" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{classroom.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{classroom.subject}</Badge>
                <span className="text-sm text-muted-foreground">by {teacher_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-1.5">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="gap-1.5">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Quizzes</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="gap-1.5">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Updates</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {classroom.description && (
            <Card>
              <CardHeader><CardTitle>About This Class</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{classroom.description}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{notes.length}</p>
                <p className="text-xs text-muted-foreground">Notes & Materials</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <ClipboardList className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{quizzes.length}</p>
                <p className="text-xs text-muted-foreground">Quizzes & Tests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Bell className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{announcements.length}</p>
                <p className="text-xs text-muted-foreground">Announcements</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Notes & Materials</CardTitle></CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                  <p className="text-muted-foreground text-sm">Your teacher hasn't shared any notes or materials yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{r.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {r.resource_type.replace('_', ' ')} • {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quizzes */}
        <TabsContent value="quizzes" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Quizzes & Tests</CardTitle></CardHeader>
            <CardContent>
              {quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No quizzes yet</h3>
                  <p className="text-muted-foreground text-sm">Your teacher hasn't assigned any quizzes or tests yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizzes.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                          <ClipboardList className="w-5 h-5 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{r.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {r.resource_type} • {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button size="sm">Start</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements */}
        <TabsContent value="announcements" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Announcements</CardTitle></CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No announcements</h3>
                  <p className="text-muted-foreground text-sm">No updates from your teacher yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map(a => (
                    <div key={a.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{a.title}</h4>
                          {a.is_pinned && <Badge variant="secondary" className="text-xs">📌 Pinned</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{a.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentClassroomDetail;
