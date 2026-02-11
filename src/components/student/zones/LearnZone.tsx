import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSubjectsForLevel, getCurrentTerm, SubjectData, StrandData, SubStrandData } from '@/data/gesCurriculum';
import LessonContentPage from './LessonContentPage';

const LearnZone: React.FC = () => {
  const { profile } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [selectedStrand, setSelectedStrand] = useState<StrandData | null>(null);
  const [selectedSubStrand, setSelectedSubStrand] = useState<SubStrandData | null>(null);

  const classGrade = (profile as any)?.class_grade || 'JHS 1';
  const firstName = profile?.first_name || 'Learner';
  const subjects = getSubjectsForLevel(classGrade);
  const { term, label: termLabel } = getCurrentTerm();

  const handleBack = () => {
    if (selectedSubStrand) {
      setSelectedSubStrand(null);
    } else if (selectedStrand) {
      setSelectedStrand(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
    }
  };

  // Lesson content view
  if (selectedSubStrand && selectedStrand && selectedSubject) {
    return (
      <LessonContentPage
        subject={selectedSubject.name}
        strand={selectedStrand.name}
        subStrand={selectedSubStrand}
        classGrade={classGrade}
        onBack={handleBack}
      />
    );
  }

  // Sub-strand selection
  if (selectedStrand && selectedSubject) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to {selectedSubject.name}</span>
        </button>

        <div className="flex items-center gap-4 mb-2">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedSubject.color} flex items-center justify-center text-2xl shadow-md`}>
            {selectedSubject.emoji}
          </div>
          <div>
            <h2 className="text-xl font-bold">{selectedStrand.name}</h2>
            <p className="text-sm text-muted-foreground">{selectedSubject.name} • Select a sub-strand to start learning</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {selectedStrand.subStrands.map((sub) => (
            <Card
              key={sub.name}
              className="group hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5"
              onClick={() => setSelectedSubStrand(sub)}
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{sub.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {sub.videos.length > 0 && (
                      <Badge variant="outline" className="text-xs">🎥 {sub.videos.length} video{sub.videos.length > 1 ? 's' : ''}</Badge>
                    )}
                    {sub.externalLinks.length > 0 && (
                      <Badge variant="outline" className="text-xs">🔗 {sub.externalLinks.length} link{sub.externalLinks.length > 1 ? 's' : ''}</Badge>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Strand selection for a subject
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
            <p className="text-muted-foreground">Select a strand to explore</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {selectedSubject.strands.map((strand) => (
            <Card
              key={strand.name}
              className="group hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5"
              onClick={() => setSelectedStrand(strand)}
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground text-lg">{strand.name}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {strand.subStrands.length} sub-strand{strand.subStrands.length > 1 ? 's' : ''}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Subject grid (default)
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-7 h-7 text-primary mt-0.5" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Welcome, {firstName}! 👋
              </h2>
              <p className="text-foreground/80 mt-1">
                You are in class <strong>{classGrade}</strong> • <strong>{termLabel}</strong>
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Keep learning and growing! These are your subjects for this term 📚
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Your Subjects ({subjects.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Card
              key={subject.name}
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
              onClick={() => setSelectedSubject(subject)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-2xl shadow-md`}>
                    {subject.emoji}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {subject.strands.length} strand{subject.strands.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                <h4 className="font-semibold text-foreground mb-2">{subject.name}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
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
