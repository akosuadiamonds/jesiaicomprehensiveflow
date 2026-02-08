import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Star, ChevronRight, Sparkles, ArrowLeft, Loader2, Lightbulb, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LessonContent {
  title: string;
  introduction: string;
  sections: { heading: string; content: string; example?: string }[];
  funFacts: string[];
  summary: string;
  estimatedDuration: string;
}

interface ClassroomResource {
  id: string;
  title: string;
  resource_type: string;
  content: any;
  created_at: string;
  classroom_name: string;
}

const subjects = [
  { name: 'Mathematics', emoji: '🔢', color: 'from-blue-500 to-indigo-600', topics: ['Algebra', 'Geometry', 'Fractions', 'Statistics'] },
  { name: 'English Language', emoji: '📖', color: 'from-green-500 to-emerald-600', topics: ['Grammar', 'Comprehension', 'Essay Writing', 'Vocabulary'] },
  { name: 'Science', emoji: '🔬', color: 'from-purple-500 to-violet-600', topics: ['Physics', 'Chemistry', 'Biology', 'The Solar System'] },
  { name: 'Social Studies', emoji: '🌍', color: 'from-amber-500 to-orange-600', topics: ['Government', 'History', 'Geography', 'Economics'] },
  { name: 'ICT', emoji: '💻', color: 'from-cyan-500 to-teal-600', topics: ['Programming', 'Hardware', 'Internet', 'Data Management'] },
];

const LearnZone: React.FC = () => {
  const { profile, user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<typeof subjects[0] | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'topics' | 'class-resources'>('topics');
  const [classResources, setClassResources] = useState<ClassroomResource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  const fetchClassResources = async (subjectName: string) => {
    if (!user) return;
    setIsLoadingResources(true);
    try {
      // Get approved classroom IDs
      const { data: enrollments } = await supabase
        .from('classroom_students')
        .select('classroom_id')
        .eq('student_id', user.id)
        .eq('is_active', true)
        .eq('approval_status', 'approved');

      if (!enrollments || enrollments.length === 0) {
        setClassResources([]);
        return;
      }

      const classIds = enrollments.map(e => e.classroom_id);

      // Get classrooms matching this subject
      const { data: matchingClassrooms } = await supabase
        .from('classrooms')
        .select('id, name, subject')
        .in('id', classIds)
        .ilike('subject', `%${subjectName}%`);

      if (!matchingClassrooms || matchingClassrooms.length === 0) {
        setClassResources([]);
        return;
      }

      const matchingIds = matchingClassrooms.map(c => c.id);

      // Get resources from those classrooms
      const { data: resources } = await supabase
        .from('classroom_resources')
        .select('*')
        .in('classroom_id', matchingIds)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      const mapped = (resources || []).map(r => ({
        ...r,
        classroom_name: matchingClassrooms.find(c => c.id === r.classroom_id)?.name || 'Class',
      }));

      setClassResources(mapped);
    } catch (err) {
      console.error('Error fetching class resources:', err);
    } finally {
      setIsLoadingResources(false);
    }
  };

  const handleSubjectClick = (subject: typeof subjects[0]) => {
    setSelectedSubject(subject);
    setViewMode('topics');
    fetchClassResources(subject.name);
  };

  const handleStartLesson = async (subject: typeof subjects[0], topic: string) => {
    setSelectedTopic(topic);
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { subject: subject.name, topic, classGrade: (profile as any)?.class_grade || 'JHS 2' },
      });

      if (error) throw error;
      setLessonContent(data);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate lesson. Please try again.');
      setSelectedTopic(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    if (lessonContent) {
      setLessonContent(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
      setSelectedTopic(null);
      setClassResources([]);
    }
  };

  // Lesson display
  if (lessonContent && selectedSubject) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to {selectedSubject.name}</span>
        </button>

        <Card className="border-primary/20">
          <CardContent className="p-6">
            <Badge variant="secondary" className="mb-3">{lessonContent.estimatedDuration}</Badge>
            <h2 className="text-2xl font-bold mb-2">{lessonContent.title}</h2>
            <p className="text-muted-foreground">{lessonContent.introduction}</p>
          </CardContent>
        </Card>

        {lessonContent.sections.map((section, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">{section.heading}</h3>
              <p className="text-foreground/90 whitespace-pre-line">{section.content}</p>
              {section.example && (
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm font-medium text-primary mb-1">📝 Example</p>
                  <p className="text-sm text-foreground/80">{section.example}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {lessonContent.funFacts.length > 0 && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Did You Know?
              </h3>
              <ul className="space-y-2">
                {lessonContent.funFacts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 mt-0.5">💡</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-green-500" />
              Key Takeaways
            </h3>
            <p className="text-sm whitespace-pre-line">{lessonContent.summary}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-1">Creating your lesson...</h3>
        <p className="text-muted-foreground text-sm">
          AI is preparing a personalized lesson on {selectedTopic}
        </p>
      </div>
    );
  }

  // Topic selection + class resources for a subject
  if (selectedSubject) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to subjects</span>
        </button>

        <div className="flex items-center gap-4 mb-2">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedSubject.color} flex items-center justify-center text-3xl shadow-md`}>
            {selectedSubject.emoji}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{selectedSubject.name}</h2>
            <p className="text-muted-foreground">Learn with AI or from your teacher's materials</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'topics' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('topics')}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            AI Lessons
          </Button>
          <Button
            variant={viewMode === 'class-resources' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('class-resources')}
          >
            <Users className="w-4 h-4 mr-1" />
            Teacher Materials
            {classResources.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">{classResources.length}</Badge>
            )}
          </Button>
        </div>

        {viewMode === 'topics' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedSubject.topics.map((topic) => (
              <Card
                key={topic}
                className="group hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                onClick={() => handleStartLesson(selectedSubject, topic)}
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{topic}</h4>
                    <p className="text-sm text-muted-foreground">AI-generated lesson</p>
                  </div>
                  <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {isLoadingResources ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : classResources.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="font-medium mb-1">No teacher materials for {selectedSubject.name}</p>
                  <p className="text-sm">Join a {selectedSubject.name} class to see materials shared by your teacher</p>
                </CardContent>
              </Card>
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
                        <Badge variant="secondary" className="text-xs">{res.classroom_name}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(res.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // Subject grid (default)
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Your Learning Journey
              </h2>
              <p className="text-muted-foreground mt-1">
                Choose a subject to start an AI lesson or view your teacher's materials 🎯
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
              onClick={() => handleSubjectClick(subject)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-2xl shadow-md`}>
                    {subject.emoji}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {subject.topics.length} topics
                  </Badge>
                </div>
                <h4 className="font-semibold text-foreground mb-2">{subject.name}</h4>
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
