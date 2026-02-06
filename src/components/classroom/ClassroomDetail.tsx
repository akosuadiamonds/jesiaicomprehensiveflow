import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, Users, BookOpen, FileText, Bell, Copy, Plus, Send,
  School, Briefcase, ClipboardList,
} from 'lucide-react';
import { Classroom, ClassroomAnnouncement, ClassroomResource } from '@/types/classroom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ClassroomStudentsTab from './ClassroomStudentsTab';

interface ClassroomDetailProps {
  classroom: Classroom;
  onBack: () => void;
}

const ClassroomDetail: React.FC<ClassroomDetailProps> = ({ classroom, onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [studentCount, setStudentCount] = useState(0);
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [resources, setResources] = useState<ClassroomResource[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  const isPrivate = classroom.classroom_type === 'private';

  useEffect(() => {
    fetchData();
  }, [classroom.id]);

  const fetchData = async () => {
    // Fetch student count
    const { count } = await supabase
      .from('classroom_students')
      .select('*', { count: 'exact', head: true })
      .eq('classroom_id', classroom.id)
      .eq('is_active', true);
    setStudentCount(count || 0);

    // Fetch announcements
    const { data: announcementsData } = await supabase
      .from('classroom_announcements')
      .select('*')
      .eq('classroom_id', classroom.id)
      .order('created_at', { ascending: false });
    setAnnouncements((announcementsData as unknown as ClassroomAnnouncement[]) || []);

    // Fetch resources
    const { data: resourcesData } = await supabase
      .from('classroom_resources')
      .select('*')
      .eq('classroom_id', classroom.id)
      .order('created_at', { ascending: false });
    setResources((resourcesData as unknown as ClassroomResource[]) || []);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(classroom.invite_code);
    toast({
      title: 'Copied!',
      description: 'Invite code copied to clipboard',
    });
  };

  const postAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content || !user) return;

    const { error } = await supabase
      .from('classroom_announcements')
      .insert({
        classroom_id: classroom.id,
        teacher_id: user.id,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to post announcement',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Announcement posted',
      });
      setNewAnnouncement({ title: '', content: '' });
      setShowAnnouncementForm(false);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
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
              {isPrivate ? (
                <Briefcase className="w-5 h-5 text-primary" />
              ) : (
                <School className="w-5 h-5 text-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{classroom.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{classroom.subject}</Badge>
                <Badge variant={isPrivate ? 'default' : 'secondary'}>
                  {isPrivate ? 'Private Class' : 'School Class'}
                </Badge>
                {isPrivate && classroom.monthly_fee > 0 && (
                  <Badge className="bg-primary/10 text-primary">
                    GHS {classroom.monthly_fee}/mo
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
          <span className="text-sm text-muted-foreground">Invite Code:</span>
          <span className="font-mono font-semibold">{classroom.invite_code}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyInviteCode}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{studentCount}</p>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {resources.filter(r => r.resource_type === 'lesson_plan').length}
              </p>
              <p className="text-sm text-muted-foreground">Lesson Plans</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {resources.filter(r => ['test', 'quiz'].includes(r.resource_type)).length}
              </p>
              <p className="text-sm text-muted-foreground">Tests & Quizzes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Bell className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{announcements.length}</p>
              <p className="text-sm text-muted-foreground">Announcements</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>About This Class</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {classroom.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <BookOpen className="h-5 w-5" />
                <span>Share Lesson Plan</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <ClipboardList className="h-5 w-5" />
                <span>Assign Test</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span>Upload Material</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => {
                  setActiveTab('announcements');
                  setShowAnnouncementForm(true);
                }}
              >
                <Bell className="h-5 w-5" />
                <span>Post Update</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <ClassroomStudentsTab
            classroomId={classroom.id}
            inviteCode={classroom.invite_code}
            maxStudents={classroom.max_students}
          />
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Resources</CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Resource
              </Button>
            </CardHeader>
            <CardContent>
              {resources.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No resources shared</h3>
                  <p className="text-muted-foreground">
                    Share lesson plans, tests, quizzes, and materials with your students.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-sm text-muted-foreground capitalize">{resource.resource_type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <Badge variant={resource.is_published ? 'default' : 'secondary'}>
                        {resource.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Announcements</CardTitle>
              <Button onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}>
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showAnnouncementForm && (
                <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
                  <Input
                    placeholder="Announcement title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Write your announcement..."
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAnnouncementForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={postAnnouncement}>
                      <Send className="mr-2 h-4 w-4" />
                      Post
                    </Button>
                  </div>
                </div>
              )}

              {announcements.length === 0 && !showAnnouncementForm ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No announcements</h3>
                  <p className="text-muted-foreground">
                    Keep your students updated with class announcements.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{announcement.content}</p>
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

export default ClassroomDetail;
