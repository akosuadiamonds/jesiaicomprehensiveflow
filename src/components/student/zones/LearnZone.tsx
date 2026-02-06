import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Clock, Star, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const subjects = [
  { name: 'Mathematics', emoji: '🔢', progress: 45, lessons: 12, color: 'from-blue-500 to-indigo-600' },
  { name: 'English Language', emoji: '📖', progress: 60, lessons: 15, color: 'from-green-500 to-emerald-600' },
  { name: 'Science', emoji: '🔬', progress: 30, lessons: 10, color: 'from-purple-500 to-violet-600' },
  { name: 'Social Studies', emoji: '🌍', progress: 75, lessons: 8, color: 'from-amber-500 to-orange-600' },
  { name: 'ICT', emoji: '💻', progress: 20, lessons: 6, color: 'from-cyan-500 to-teal-600' },
];

const recentLessons = [
  { title: 'Algebra Basics', subject: 'Mathematics', duration: '15 min', completed: true },
  { title: 'Reading Comprehension', subject: 'English', duration: '20 min', completed: false },
  { title: 'The Solar System', subject: 'Science', duration: '18 min', completed: false },
];

const LearnZone: React.FC = () => {
  const { profile } = useAuth();

  const handleStartLesson = (subject: string) => {
    toast.success(`Starting ${subject} lesson! 📚`, {
      description: 'Get ready to learn something new!',
    });
  };

  const handleContinueLearning = (lesson: string) => {
    toast.info(`Continuing: ${lesson}`, {
      description: 'Pick up where you left off!',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Your Learning Journey
              </h2>
              <p className="text-muted-foreground mt-1">
                You've completed 45% of your weekly goal. Keep going! 🎯
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Play className="w-4 h-4 mr-2" />
              Continue Learning
            </Button>
          </div>
          <Progress value={45} className="mt-4 h-2" />
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Your Subjects
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Card 
              key={subject.name} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
              onClick={() => handleStartLesson(subject.name)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-2xl shadow-md`}>
                    {subject.emoji}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {subject.lessons} lessons
                  </Badge>
                </div>
                <h4 className="font-semibold text-foreground mb-2">{subject.name}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{subject.progress}%</span>
                  </div>
                  <Progress value={subject.progress} className="h-2" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Start Learning
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Lessons */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Continue Where You Left Off
        </h3>
        <div className="space-y-3">
          {recentLessons.map((lesson, index) => (
            <Card 
              key={index}
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleContinueLearning(lesson.title)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${lesson.completed ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'}`}>
                    {lesson.completed ? (
                      <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Play className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{lesson.title}</h4>
                    <p className="text-sm text-muted-foreground">{lesson.subject} • {lesson.duration}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Daily Tip */}
      <Card className="bg-gradient-to-r from-secondary/50 to-secondary/30 border-secondary">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-semibold text-foreground">Daily Learning Tip</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Break your study sessions into 25-minute focused blocks with 5-minute breaks. 
                This technique, called Pomodoro, helps you retain information better!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearnZone;
