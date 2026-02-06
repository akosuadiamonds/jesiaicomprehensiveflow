import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dumbbell, 
  Clock, 
  Target, 
  Trophy, 
  Brain,
  Play,
  Zap,
  FileQuestion,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';

const subjects = [
  'Mathematics', 'English Language', 'Science', 'Social Studies', 'ICT', 
  'French', 'Religious & Moral Education', 'Creative Arts'
];

const topics: Record<string, string[]> = {
  'Mathematics': ['Algebra', 'Geometry', 'Fractions', 'Statistics', 'Trigonometry'],
  'English Language': ['Grammar', 'Comprehension', 'Essay Writing', 'Vocabulary', 'Literature'],
  'Science': ['Physics', 'Chemistry', 'Biology', 'The Human Body', 'Forces'],
  'Social Studies': ['Government', 'History', 'Geography', 'Civics', 'Economics'],
  'ICT': ['Programming', 'Hardware', 'Software', 'Internet', 'Data Management'],
};

const recentPractice = [
  { subject: 'Mathematics', topic: 'Algebra', score: 85, questions: 20, date: 'Today' },
  { subject: 'Science', topic: 'Physics', score: 70, questions: 15, date: 'Yesterday' },
  { subject: 'English', topic: 'Grammar', score: 90, questions: 25, date: '2 days ago' },
];

const PracticeZone: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [practiceType, setPracticeType] = useState<'quick' | 'mock' | 'exam'>('quick');

  const handleStartPractice = () => {
    if (!selectedSubject || !selectedTopic) {
      toast.error('Please select a subject and topic first!');
      return;
    }
    
    const messages = {
      quick: '⚡ Quick practice starting! 10 questions coming up!',
      mock: '📝 Mock test starting! Get ready for a comprehensive assessment!',
      exam: '🎯 Timed exam simulation starting! Good luck!'
    };
    
    toast.success(messages[practiceType], {
      description: `${selectedSubject} - ${selectedTopic}`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Practice Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Questions Answered', value: '248', icon: FileQuestion, color: 'text-blue-600' },
          { label: 'Accuracy Rate', value: '78%', icon: Target, color: 'text-green-600' },
          { label: 'Time Practiced', value: '12h', icon: Clock, color: 'text-purple-600' },
          { label: 'Streak', value: '5 days', icon: Zap, color: 'text-amber-600' },
        ].map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Practice Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Start Practicing
          </CardTitle>
          <CardDescription>
            Choose your practice type and start improving!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Practice Type Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                id: 'quick', 
                title: 'Quick Practice', 
                desc: '10-20 questions', 
                icon: Zap,
                emoji: '⚡'
              },
              { 
                id: 'mock', 
                title: 'Mock Test', 
                desc: 'Full topic coverage', 
                icon: Brain,
                emoji: '📝'
              },
              { 
                id: 'exam', 
                title: 'Timed Exam', 
                desc: 'BECE/WASSCE style', 
                icon: Timer,
                emoji: '🎯'
              },
            ].map((type) => (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  practiceType === type.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setPracticeType(type.id as any)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{type.emoji}</div>
                  <h4 className="font-semibold">{type.title}</h4>
                  <p className="text-sm text-muted-foreground">{type.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Subject & Topic Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Subject</label>
              <Select value={selectedSubject} onValueChange={(v) => {
                setSelectedSubject(v);
                setSelectedTopic('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Topic</label>
              <Select 
                value={selectedTopic} 
                onValueChange={setSelectedTopic}
                disabled={!selectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a topic" />
                </SelectTrigger>
                <SelectContent>
                  {(topics[selectedSubject] || []).map((topic) => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Difficulty for Mock & Exam */}
          {practiceType !== 'quick' && (
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <p className="text-sm font-medium">Difficulty Level</p>
              <div className="flex gap-2">
                {['Easy', 'Medium', 'Hard'].map((level) => (
                  <Badge 
                    key={level}
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
                  >
                    {level}
                  </Badge>
                ))}
              </div>
              {practiceType === 'exam' && (
                <p className="text-xs text-muted-foreground">
                  ⏱️ Timed exam: 60 minutes for 50 questions
                </p>
              )}
            </div>
          )}

          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-primary to-primary/80"
            onClick={handleStartPractice}
          >
            <Play className="w-5 h-5 mr-2" />
            Start {practiceType === 'quick' ? 'Quick Practice' : practiceType === 'mock' ? 'Mock Test' : 'Timed Exam'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Practice History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Recent Practice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPractice.map((practice, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    practice.score >= 80 ? 'bg-green-100 text-green-600' :
                    practice.score >= 60 ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <span className="font-bold">{practice.score}%</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{practice.subject} - {practice.topic}</h4>
                    <p className="text-sm text-muted-foreground">
                      {practice.questions} questions • {practice.date}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Retry
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeZone;
