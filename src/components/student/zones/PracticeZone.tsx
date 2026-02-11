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
import {
  Dumbbell,
  Clock,
  Target,
  Brain,
  Play,
  Zap,
  FileQuestion,
  Timer,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PracticeHistory from './PracticeHistory';

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

type DOKLevel = 1 | 2 | 3 | 4;

interface PracticeQuestion {
  number: number;
  question: string;
  format: string;
  options?: { label: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

interface PracticeData {
  questions: PracticeQuestion[];
  totalQuestions: number;
  estimatedTime: string;
}

const dokDescriptions: Record<DOKLevel, string> = {
  1: 'Recall & Reproduce',
  2: 'Skills & Concepts',
  3: 'Strategic Thinking',
  4: 'Extended Thinking',
};

const PracticeZone: React.FC = () => {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [practiceType, setPracticeType] = useState<'quick' | 'mock' | 'exam'>('quick');
  const [dokLevel, setDokLevel] = useState<DOKLevel>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);
  const [startTime] = useState<number>(Date.now());

  const handleStartPractice = async () => {
    if (!selectedSubject || !selectedTopic) {
      toast.error('Please select a subject and topic first!');
      return;
    }

    setIsGenerating(true);
    try {
      const questionCounts = { quick: 10, mock: 20, exam: 30 };
      const { data, error } = await supabase.functions.invoke('generate-practice', {
        body: {
          subject: selectedSubject,
          topic: selectedTopic,
          practiceType,
          difficulty: dokLevel,
          questionCount: questionCounts[practiceType],
        },
      });

      if (error) throw error;
      setPracticeData(data);
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (questionNum: number, answer: string) => {
    setAnswers({ ...answers, [questionNum]: answer });
  };

  const getScore = () => {
    if (!practiceData) return 0;
    let correct = 0;
    practiceData.questions.forEach((q) => {
      if (answers[q.number]?.toLowerCase() === q.correctAnswer.toLowerCase()) correct++;
    });
    return correct;
  };

  const savePracticeSession = async (score: number, total: number) => {
    if (!user) return;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    await supabase.from('practice_sessions').insert({
      student_id: user.id,
      subject: selectedSubject,
      topic: selectedTopic,
      session_type: practiceType === 'exam' ? 'timed_exam' : practiceType,
      total_questions: total,
      correct_answers: score,
      difficulty_level: String(dokLevel),
      time_spent_seconds: timeSpent,
      completed_at: new Date().toISOString(),
    });
  };

  const handleSubmit = async () => {
    const totalAnswered = Object.keys(answers).length;
    if (totalAnswered < (practiceData?.questions.length || 0)) {
      toast.info(`You have ${(practiceData?.questions.length || 0) - totalAnswered} unanswered questions`);
    }
    const score = getScore();
    await savePracticeSession(score, practiceData?.questions.length || 0);
    setShowResults(true);
  };

  const handleBackToSetup = () => {
    setPracticeData(null);
    setAnswers({});
    setShowResults(false);
    setShowExplanation(null);
  };

  // Loading
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-1">Generating questions...</h3>
        <p className="text-muted-foreground text-sm">
          AI is creating {practiceType} practice for {selectedTopic}
        </p>
      </div>
    );
  }

  // Results view
  if (showResults && practiceData) {
    const score = getScore();
    const total = practiceData.questions.length;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="space-y-6 animate-fade-in">
        <button onClick={handleBackToSetup} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">New Practice</span>
        </button>

        <Card className={`border-2 ${percentage >= 70 ? 'border-green-300 bg-green-50 dark:bg-green-950/20' : 'border-amber-300 bg-amber-50 dark:bg-amber-950/20'}`}>
          <CardContent className="p-6 text-center">
            <div className="text-5xl mb-3">{percentage >= 80 ? '🏆' : percentage >= 60 ? '👏' : '💪'}</div>
            <h2 className="text-3xl font-bold">{score}/{total}</h2>
            <p className="text-lg text-muted-foreground">{percentage}% correct</p>
            <Badge className="mt-2" variant={percentage >= 70 ? 'default' : 'secondary'}>
              {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good job!' : 'Keep practicing!'}
            </Badge>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {practiceData.questions.map((q) => {
            const isCorrect = answers[q.number]?.toLowerCase() === q.correctAnswer.toLowerCase();
            return (
              <Card key={q.number} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                        <span className="font-medium text-sm">Q{q.number}</span>
                      </div>
                      <p className="text-sm">{q.question}</p>
                      {!isCorrect && (
                        <p className="text-xs text-green-600 mt-1">Correct: {q.correctAnswer}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowExplanation(showExplanation === q.number ? null : q.number)}>
                      {showExplanation === q.number ? 'Hide' : 'Explain'}
                    </Button>
                  </div>
                  {showExplanation === q.number && (
                    <div className="mt-3 p-3 rounded-lg bg-muted text-sm">{q.explanation}</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Active practice
  if (practiceData) {
    const q = practiceData.questions[currentQuestion];
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <button onClick={handleBackToSetup} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Exit</span>
          </button>
          <Badge variant="secondary">{Object.keys(answers).length}/{practiceData.questions.length} answered</Badge>
        </div>

        <Progress value={((currentQuestion + 1) / practiceData.questions.length) * 100} className="h-2" />

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Badge>Q{q.number} of {practiceData.questions.length}</Badge>
              <Badge variant="outline">{q.format.replace('_', ' ')}</Badge>
            </div>
            <p className="text-lg font-medium mb-6">{q.question}</p>

            {q.format === 'mcq' && q.options && (
              <div className="space-y-3">
                {q.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleAnswer(q.number, opt.label)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[q.number] === opt.label
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="font-semibold mr-2">{opt.label}.</span>
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {q.format === 'true_false' && (
              <div className="grid grid-cols-2 gap-4">
                {['True', 'False'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(q.number, option)}
                    className={`p-4 rounded-lg border-2 transition-all font-medium ${
                      answers[q.number] === option
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {q.format === 'short_answer' && (
              <input
                type="text"
                placeholder="Type your answer..."
                value={answers[q.number] || ''}
                onChange={(e) => handleAnswer(q.number, e.target.value)}
                className="w-full p-4 rounded-lg border-2 border-border focus:border-primary outline-none bg-background"
              />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          {currentQuestion < practiceData.questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              Submit Answers
            </Button>
          )}
        </div>

        {/* Question navigator */}
        <div className="flex flex-wrap gap-2 justify-center">
          {practiceData.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestion(i)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                i === currentQuestion
                  ? 'bg-primary text-primary-foreground'
                  : answers[practiceData.questions[i].number]
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Setup view
  return (
    <div className="space-y-6 animate-fade-in">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Start Practicing
          </CardTitle>
          <CardDescription>Choose your practice type and start improving!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'quick', title: 'Quick Practice', desc: '10 questions', emoji: '⚡' },
              { id: 'mock', title: 'Mock Test', desc: '20 questions', emoji: '📝' },
              { id: 'exam', title: 'Timed Exam', desc: '30 questions', emoji: '🎯' },
            ].map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  practiceType === type.id ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Subject</label>
              <Select value={selectedSubject} onValueChange={(v) => { setSelectedSubject(v); setSelectedTopic(''); }}>
                <SelectTrigger><SelectValue placeholder="Choose a subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Topic</label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!selectedSubject}>
                <SelectTrigger><SelectValue placeholder="Choose a topic" /></SelectTrigger>
                <SelectContent>
                  {(topics[selectedSubject] || []).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <p className="text-sm font-medium">DOK Level (Depth of Knowledge)</p>
            <div className="flex gap-2 flex-wrap">
              {([1, 2, 3, 4] as DOKLevel[]).map((level) => (
                <Badge
                  key={level}
                  variant={dokLevel === level ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors px-4 py-2"
                  onClick={() => setDokLevel(level)}
                >
                  DOK {level}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{dokDescriptions[dokLevel]}</p>
          </div>

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

      <PracticeHistory />
    </div>
  );
};

export default PracticeZone;
