import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BookOpen, 
  Video, 
  Radio, 
  Search,
  Plus,
  ChevronRight,
  Bell,
  FileText,
  Calendar,
  MessageSquare
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

const myClasses = [
  { 
    id: '1',
    name: 'Mathematics Class', 
    teacher: 'Mr. Kofi Mensah', 
    type: 'school',
    subject: 'Mathematics',
    students: 35,
    nextClass: 'Today, 2:00 PM',
    unread: 2
  },
  { 
    id: '2',
    name: 'BECE Prep - Science', 
    teacher: 'Mrs. Ama Owusu', 
    type: 'private',
    subject: 'Integrated Science',
    students: 12,
    nextClass: 'Tomorrow, 4:00 PM',
    unread: 0
  },
];

const availableClasses = [
  { id: '3', name: 'English Excellence', teacher: 'Mr. Yaw Appiah', subject: 'English', students: 28, fee: 50 },
  { id: '4', name: 'ICT Mastery', teacher: 'Ms. Efua Darko', subject: 'ICT', students: 20, fee: 40 },
  { id: '5', name: 'Social Studies Pro', teacher: 'Mr. Kwame Asante', subject: 'Social Studies', students: 32, fee: 0 },
];

const announcements = [
  { title: 'Upcoming Quiz', content: 'Algebra quiz this Friday! Make sure to revise chapters 4-6.', date: '2 hours ago', class: 'Mathematics Class' },
  { title: 'New Study Material', content: 'Notes on photosynthesis have been uploaded.', date: '1 day ago', class: 'BECE Prep - Science' },
];

const ClassZone: React.FC = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  const handleJoinClass = () => {
    if (inviteCode.length !== 6) {
      toast.error('Please enter a valid 6-character invite code');
      return;
    }
    toast.success('Successfully joined the class! 🎉', {
      description: 'Welcome to your new classroom!',
    });
    setInviteCode('');
    setIsJoinDialogOpen(false);
  };

  const handleBrowseJoin = (className: string) => {
    toast.success(`Joined ${className}! 🎉`, {
      description: 'You can now access all class materials.',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Join Button */}
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
              <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleJoinClass}>Join Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Classes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">My Classes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myClasses.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-lg">{cls.name}</h4>
                      {cls.unread > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {cls.unread} new
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{cls.teacher}</p>
                  </div>
                  <Badge variant={cls.type === 'school' ? 'secondary' : 'outline'}>
                    {cls.type === 'school' ? '🏫 School' : '📚 Private'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {cls.students} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {cls.nextClass}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <BookOpen className="w-4 h-4" />
                    Notes
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Video className="w-4 h-4" />
                    Videos
                  </Button>
                  <Button size="sm" className="flex-1 gap-1 bg-primary">
                    <Radio className="w-4 h-4" />
                    Live
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Tabs defaultValue="announcements">
        <TabsList>
          <TabsTrigger value="announcements" className="gap-2">
            <Bell className="w-4 h-4" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="browse" className="gap-2">
            <Search className="w-4 h-4" />
            Browse Classes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-4">
          <div className="space-y-3">
            {announcements.map((announcement, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <span className="text-xs text-muted-foreground">{announcement.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{announcement.content}</p>
                      <Badge variant="outline" className="mt-2 text-xs">{announcement.class}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="browse" className="mt-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search classes..." className="pl-10" />
            </div>
          </div>
          <div className="space-y-3">
            {availableClasses.map((cls) => (
              <Card key={cls.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{cls.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {cls.teacher} • {cls.students} students
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {cls.fee > 0 ? (
                      <Badge variant="secondary">GHS {cls.fee}/month</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600">Free</Badge>
                    )}
                    <Button size="sm" onClick={() => handleBrowseJoin(cls.name)}>
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassZone;
