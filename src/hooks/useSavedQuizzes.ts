import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratedQuizTest } from '@/types/quiz';

export const useSavedQuizzes = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<GeneratedQuizTest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_quizzes' as any)
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setQuizzes((data as any[]).map(mapDbToQuiz));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const saveQuiz = async (quiz: GeneratedQuizTest): Promise<string | null> => {
    if (!user) return null;
    const row = mapQuizToDb(quiz, user.id);
    const { data, error } = await supabase
      .from('saved_quizzes' as any)
      .insert(row as any)
      .select('id')
      .single();
    if (error) { console.error('Error saving quiz:', error); return null; }
    await fetchQuizzes();
    return (data as any)?.id;
  };

  const updateQuiz = async (id: string, quiz: Partial<GeneratedQuizTest>) => {
    if (!user) return;
    const updates: any = {};
    if (quiz.questions !== undefined) updates.questions = quiz.questions;
    if (quiz.status !== undefined) updates.status = quiz.status;
    if (quiz.assignedClassroomId !== undefined) updates.assigned_classroom_id = quiz.assignedClassroomId || null;
    if (quiz.totalMarks !== undefined) updates.total_marks = quiz.totalMarks;

    await supabase.from('saved_quizzes' as any).update(updates as any).eq('id', id);
    await fetchQuizzes();
  };

  const deleteQuiz = async (id: string) => {
    await supabase.from('saved_quizzes' as any).delete().eq('id', id);
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  return { quizzes, loading, saveQuiz, updateQuiz, deleteQuiz, refetch: fetchQuizzes };
};

function mapDbToQuiz(row: any): GeneratedQuizTest {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    subject: row.subject,
    class: row.class,
    level: row.level,
    duration: row.duration,
    questionFormats: row.question_formats || ['mcq'],
    dokLevel: row.dok_level,
    questions: row.questions || [],
    totalMarks: row.total_marks,
    isLocked: row.is_locked,
    accessCode: row.access_code,
    assignedClassroomId: row.assigned_classroom_id || '',
    status: row.status,
    createdAt: new Date(row.created_at),
  };
}

function mapQuizToDb(quiz: GeneratedQuizTest, teacherId: string) {
  return {
    teacher_id: teacherId,
    type: quiz.type,
    title: quiz.title,
    subject: quiz.subject,
    class: quiz.class,
    level: quiz.level,
    duration: quiz.duration,
    question_formats: quiz.questionFormats,
    dok_level: quiz.dokLevel,
    questions: quiz.questions,
    total_marks: quiz.totalMarks,
    is_locked: quiz.isLocked,
    access_code: quiz.accessCode || '',
    assigned_classroom_id: quiz.assignedClassroomId || null,
    status: quiz.status,
  };
}
