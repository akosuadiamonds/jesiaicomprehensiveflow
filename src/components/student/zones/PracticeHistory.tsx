import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Trophy, Target, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface PracticeSessionRow {
  id: string;
  subject: string;
  topic: string;
  session_type: string;
  total_questions: number;
  correct_answers: number;
  difficulty_level: string | null;
  time_spent_seconds: number | null;
  completed_at: string | null;
  created_at: string;
}

const PracticeHistory: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<PracticeSessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setSessions(data as PracticeSessionRow[]);
      }
      setLoading(false);
    };
    fetchSessions();
  }, [user]);

  if (loading) return null;
  if (sessions.length === 0) return null;

  const formatType = (t: string) => {
    switch (t) {
      case 'quick': return 'Quick Practice';
      case 'mock': return 'Mock Test';
      case 'timed_exam': return 'Timed Exam';
      default: return t;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5" />
            Practice History
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-3">
          {sessions.map((s) => {
            const percentage = s.total_questions > 0 ? Math.round((s.correct_answers / s.total_questions) * 100) : 0;
            return (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{s.subject}</p>
                    <Badge variant="outline" className="text-xs">{s.topic}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{formatType(s.session_type)}</span>
                    <span>DOK {s.difficulty_level || '—'}</span>
                    <span>{s.completed_at ? format(new Date(s.completed_at), 'MMM d, yyyy') : format(new Date(s.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className="flex items-center gap-1">
                    {percentage >= 70 ? (
                      <Trophy className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Target className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={`font-bold text-sm ${percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                      {s.correct_answers}/{s.total_questions}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
};

export default PracticeHistory;
