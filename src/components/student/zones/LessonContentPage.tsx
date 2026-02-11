import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, BookOpen, Play, Video, ExternalLink, MessageCircle, Dumbbell,
  Loader2, CheckCircle2, Send, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';
import { SubStrandData } from '@/data/gesCurriculum';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useStudent } from '@/contexts/StudentContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LessonContent {
  title: string;
  introduction: string;
  sections: { heading: string; content: string; example?: string }[];
  funFacts: string[];
  summary: string;
  estimatedDuration: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LessonContentPageProps {
  subject: string;
  strand: string;
  subStrand: SubStrandData;
  classGrade: string;
  onBack: () => void;
}

const SURVEY_OPTIONS = [
  { emoji: '😊', label: 'Yes, I understood it well', value: 'understood' },
  { emoji: '🤔', label: 'Somewhat, but I have questions', value: 'partial' },
  { emoji: '😕', label: 'Not really, I need more help', value: 'not_understood' },
  { emoji: '📖', label: 'I need to re-read it', value: 'reread' },
];

const LessonContentPage: React.FC<LessonContentPageProps> = ({
  subject, strand, subStrand, classGrade, onBack
}) => {
  const { profile } = useAuth();
  const { setCurrentPage } = useStudent();
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const [sectionsRead, setSectionsRead] = useState<Set<number>>(new Set());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    reading: true, videos: false, links: false, chat: false, practice: false
  });
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyContext, setSurveyContext] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateLesson();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const generateLesson = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: { subject, topic: `${strand} - ${subStrand.name}`, classGrade },
      });
      if (error) throw error;
      setLessonContent(data);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate lesson');
    } finally {
      setIsGenerating(false);
    }
  };

  const markSectionRead = (index: number) => {
    const newRead = new Set(sectionsRead);
    newRead.add(index);
    setSectionsRead(newRead);
    if (lessonContent) {
      const totalSections = lessonContent.sections.length + 2;
      setReadProgress(Math.round((newRead.size / totalSections) * 100));
    }
    // Show survey randomly (~50% of the time) or on key sections
    if (Math.random() > 0.5 || index === 999) {
      setSurveyContext('reading');
      setShowSurvey(true);
    }
  };

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatting) return;

    const userMsg: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);

    let assistantContent = '';
    const allMessages = [...chatMessages, userMsg];

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          subject,
          strand,
          subStrand: subStrand.name,
          classGrade,
        }),
      });

      if (!resp.ok || !resp.body) throw new Error('Failed to connect');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setChatMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
                }
                return [...prev, { role: 'assistant', content: assistantContent }];
              });
            }
          } catch { /* partial json */ }
        }
      }
    } catch (err: any) {
      toast.error('Failed to send message');
      setChatMessages(prev => prev.filter(m => m !== userMsg));
    } finally {
      setIsChatting(false);
      // Randomly trigger understanding survey after chat
      if (Math.random() > 0.6) {
        setSurveyContext('chat');
        setShowSurvey(true);
      }
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-1">Preparing your lesson...</h3>
        <p className="text-muted-foreground text-sm">
          AI is creating content for {subStrand.name}
        </p>
      </div>
    );
  }

  const SectionHeader: React.FC<{
    title: string; icon: React.ReactNode; sectionKey: keyof typeof expandedSections;
    badge?: string;
  }> = ({ title, icon, sectionKey, badge }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-semibold">{title}</span>
        {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
      </div>
      {expandedSections[sectionKey] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to {strand}</span>
      </button>

      {/* Header */}
      <Card className="border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{subject}</Badge>
            <Badge variant="secondary">{strand}</Badge>
          </div>
          <h2 className="text-xl font-bold mb-1">{subStrand.name}</h2>
          {lessonContent && (
            <p className="text-sm text-muted-foreground">{lessonContent.estimatedDuration} reading</p>
          )}
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Reading Progress</span>
            <span className="text-sm text-muted-foreground">{readProgress}%</span>
          </div>
          <Progress value={readProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* 📖 Reading Material */}
      <div>
        <SectionHeader title="Reading Material" icon={<BookOpen className="w-5 h-5 text-primary" />} sectionKey="reading" />
        {expandedSections.reading && lessonContent && (
          <div className="mt-3 space-y-3">
            {/* Introduction */}
            <Card className={`transition-all ${sectionsRead.has(-1) ? 'border-green-300 dark:border-green-800' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{lessonContent.title}</h3>
                    <p className="text-foreground/90">{lessonContent.introduction}</p>
                  </div>
                  <Button
                    variant={sectionsRead.has(-1) ? 'default' : 'outline'}
                    size="sm"
                    className="shrink-0"
                    onClick={() => markSectionRead(-1)}
                  >
                    {sectionsRead.has(-1) ? <CheckCircle2 className="w-4 h-4" /> : 'Mark Read'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sections */}
            {lessonContent.sections.map((section, i) => (
              <Card key={i} className={`transition-all ${sectionsRead.has(i) ? 'border-green-300 dark:border-green-800' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{section.heading}</h3>
                      <p className="text-foreground/90 whitespace-pre-line text-sm">{section.content}</p>
                      {section.example && (
                        <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-xs font-medium text-primary mb-1">📝 Example</p>
                          <p className="text-sm text-foreground/80">{section.example}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant={sectionsRead.has(i) ? 'default' : 'outline'}
                      size="sm"
                      className="shrink-0"
                      onClick={() => markSectionRead(i)}
                    >
                      {sectionsRead.has(i) ? <CheckCircle2 className="w-4 h-4" /> : 'Mark Read'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Fun Facts */}
            {lessonContent.funFacts.length > 0 && (
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">💡 Did You Know?</h3>
                  <ul className="space-y-1.5">
                    {lessonContent.funFacts.map((fact, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card className={`bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 ${sectionsRead.has(999) ? 'ring-2 ring-green-400' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">⭐ Key Takeaways</h3>
                    <p className="text-sm whitespace-pre-line">{lessonContent.summary}</p>
                  </div>
                  <Button
                    variant={sectionsRead.has(999) ? 'default' : 'outline'}
                    size="sm"
                    className="shrink-0"
                    onClick={() => markSectionRead(999)}
                  >
                    {sectionsRead.has(999) ? <CheckCircle2 className="w-4 h-4" /> : 'Mark Read'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 🎥 Videos */}
      <div>
        <SectionHeader
          title="Video Tutorials"
          icon={<Video className="w-5 h-5 text-red-500" />}
          sectionKey="videos"
          badge={`${subStrand.videos.length} video${subStrand.videos.length !== 1 ? 's' : ''}`}
        />
        {expandedSections.videos && (
          <div className="mt-3 space-y-3">
            {subStrand.videos.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No videos available for this topic yet</p>
                </CardContent>
              </Card>
            ) : (
              subStrand.videos.map((video, i) => {
                const videoId = video.url.includes('watch?v=')
                  ? video.url.split('watch?v=')[1]?.split('&')[0]
                  : video.url.split('/').pop();
                return (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-video bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={video.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium text-sm">{video.title}</p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 🔗 External Links */}
      <div>
        <SectionHeader
          title="External Resources"
          icon={<ExternalLink className="w-5 h-5 text-blue-500" />}
          sectionKey="links"
          badge={`${subStrand.externalLinks.length} link${subStrand.externalLinks.length !== 1 ? 's' : ''}`}
        />
        {expandedSections.links && (
          <div className="mt-3 space-y-2">
            {subStrand.externalLinks.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <ExternalLink className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No external resources for this topic yet</p>
                </CardContent>
              </Card>
            ) : (
              subStrand.externalLinks.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">
                  <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <ExternalLink className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{link.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))
            )}
          </div>
        )}
      </div>

      {/* 🤖 Ask Jesi AI */}
      <div>
        <SectionHeader
          title="Ask Jesi AI"
          icon={<Sparkles className="w-5 h-5 text-amber-500" />}
          sectionKey="chat"
        />
        {expandedSections.chat && (
          <div className="mt-3">
            <Card>
              <CardContent className="p-4">
                {/* Chat messages */}
                <div className="max-h-80 overflow-y-auto space-y-3 mb-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Ask me anything about <strong>{subStrand.name}</strong>!</p>
                      <p className="text-xs mt-1">I'll help you understand the topic better 😊</p>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isChatting && chatMessages[chatMessages.length - 1]?.role !== 'assistant' && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-xl">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat input */}
                <div className="flex gap-2">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your question..."
                    className="min-h-[44px] max-h-24 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || isChatting}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 🏋️ Practice */}
      <div>
        <SectionHeader
          title="Test Your Knowledge"
          icon={<Dumbbell className="w-5 h-5 text-green-500" />}
          sectionKey="practice"
        />
        {expandedSections.practice && (
          <div className="mt-3">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-bold text-lg mb-1">Ready to Practice?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Test your understanding of {subStrand.name} with fun exercises in the Practice Zone!
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  onClick={() => setCurrentPage('practice')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Go to Practice Zone
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Understanding Survey Dialog */}
      <Dialog open={showSurvey} onOpenChange={setShowSurvey}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              📋 Quick Check-in
            </DialogTitle>
            <DialogDescription>
              {surveyContext === 'chat'
                ? 'After chatting with Jesi AI, did the explanation help?'
                : 'Did you understand the material you just read?'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {SURVEY_OPTIONS.map((option) => (
              <Card
                key={option.value}
                className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
                onClick={() => {
                  setShowSurvey(false);
                  if (option.value === 'understood') {
                    toast.success('Great job! Keep going! 🎉');
                  } else if (option.value === 'partial') {
                    toast.info('Try asking Jesi AI for more help! 🤖');
                  } else if (option.value === 'not_understood') {
                    toast.info("That's okay! Try re-reading or ask Jesi AI for help 💪");
                  } else {
                    toast.info('Take your time — re-reading helps! 📖');
                  }
                }}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowSurvey(false)}>
              Skip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonContentPage;
