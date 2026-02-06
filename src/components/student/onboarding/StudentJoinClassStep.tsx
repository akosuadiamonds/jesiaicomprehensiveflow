import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, BookOpen, ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const availableClasses = [
  { id: '1', name: 'Mathematics Excellence', teacher: 'Mr. Kofi Mensah', subject: 'Mathematics', students: 35, type: 'school' },
  { id: '2', name: 'BECE English Prep', teacher: 'Mrs. Ama Owusu', subject: 'English', students: 28, type: 'school' },
  { id: '3', name: 'Science Masters', teacher: 'Mr. Yaw Appiah', subject: 'Science', students: 42, type: 'private' },
  { id: '4', name: 'Social Studies Pro', teacher: 'Ms. Efua Darko', subject: 'Social Studies', students: 30, type: 'school' },
];

const StudentJoinClassStep: React.FC = () => {
  const { setCurrentStep, teacherProfile } = useOnboarding();
  const { updateProfile } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [joinedClasses, setJoinedClasses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinWithCode = () => {
    if (inviteCode.length !== 6) {
      toast.error('Please enter a valid 6-character invite code');
      return;
    }
    toast.success('Class joined successfully! 🎉');
    setInviteCode('');
  };

  const handleJoinClass = (classId: string, className: string) => {
    if (joinedClasses.includes(classId)) {
      toast.info('You\'ve already joined this class');
      return;
    }
    setJoinedClasses([...joinedClasses, classId]);
    toast.success(`Joined ${className}! 🎉`);
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Save subjects and user_role to profile
      await updateProfile({
        subjects: teacherProfile.subjects || [],
        user_role: 'learner',
      });
      setCurrentStep('student-plans');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClasses = availableClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🏫</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Join Your Classes
        </h2>
        <p className="text-muted-foreground">
          Connect with your teachers and classmates
        </p>
      </div>

      <Tabs defaultValue="code" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="code">Enter Invite Code</TabsTrigger>
          <TabsTrigger value="browse">Browse Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="mt-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Ask your teacher for the class invite code
              </p>
              <Input
                placeholder="Enter 6-character code (e.g., ABC123)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono h-14"
              />
              <Button 
                className="w-full" 
                onClick={handleJoinWithCode}
                disabled={inviteCode.length !== 6}
              >
                Join Class
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse" className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search classes..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {filteredClasses.map((cls) => (
              <Card 
                key={cls.id} 
                className={`transition-all ${
                  joinedClasses.includes(cls.id) 
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
                    : 'hover:shadow-md'
                }`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{cls.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {cls.teacher}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {cls.subject}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {cls.students}
                        </span>
                      </div>
                    </div>
                  </div>
                  {joinedClasses.includes(cls.id) ? (
                    <Badge className="bg-green-500">Joined ✓</Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleJoinClass(cls.id, cls.name)}
                    >
                      Join
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {joinedClasses.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-center">
          <p className="text-sm text-green-700 dark:text-green-300">
            🎉 You've joined {joinedClasses.length} class{joinedClasses.length > 1 ? 'es' : ''}!
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={() => setCurrentStep('subjects')}>
          Back
        </Button>
        <Button onClick={handleContinue} className="gap-2" disabled={isLoading}>
          {isLoading ? 'Saving...' : joinedClasses.length > 0 ? 'Continue' : 'Skip for now'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default StudentJoinClassStep;
