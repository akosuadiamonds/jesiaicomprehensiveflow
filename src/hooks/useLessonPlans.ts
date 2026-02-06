import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratedLessonPlan } from '@/types/lesson';

export const useLessonPlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<GeneratedLessonPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_lesson_plans' as any)
      .select('*')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPlans((data as any[]).map(mapDbToLessonPlan));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const savePlan = async (plan: GeneratedLessonPlan): Promise<string | null> => {
    if (!user) return null;
    const row = mapLessonPlanToDb(plan, user.id);
    const { data, error } = await supabase
      .from('saved_lesson_plans' as any)
      .insert(row as any)
      .select('id')
      .single();
    if (error) { console.error('Error saving plan:', error); return null; }
    await fetchPlans();
    return (data as any)?.id;
  };

  const updatePlan = async (id: string, plan: GeneratedLessonPlan) => {
    if (!user) return;
    const row = mapLessonPlanToDb(plan, user.id);
    delete (row as any).teacher_id;
    await supabase.from('saved_lesson_plans' as any).update(row as any).eq('id', id);
    await fetchPlans();
  };

  const deletePlan = async (id: string) => {
    await supabase.from('saved_lesson_plans' as any).delete().eq('id', id);
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  return { plans, loading, savePlan, updatePlan, deletePlan, refetch: fetchPlans };
};

function mapDbToLessonPlan(row: any): GeneratedLessonPlan {
  return {
    id: row.id,
    subject: row.subject,
    duration: row.duration,
    class: row.class,
    classSize: row.class_size,
    strand: row.strand,
    subStrand: row.sub_strand,
    contentStandard: row.content_standard,
    indicator: row.indicator,
    performanceIndicator: row.performance_indicator,
    coreCompetencies: row.core_competencies,
    teachingResources: row.teaching_resources,
    keywords: row.keywords || [],
    references: row.references_text,
    phases: row.phases || [],
    lessonNote: row.lesson_note,
    createdAt: new Date(row.created_at),
  };
}

function mapLessonPlanToDb(plan: GeneratedLessonPlan, teacherId: string) {
  return {
    teacher_id: teacherId,
    subject: plan.subject,
    class: plan.class,
    class_size: plan.classSize,
    strand: plan.strand,
    sub_strand: plan.subStrand,
    content_standard: plan.contentStandard,
    indicator: plan.indicator,
    performance_indicator: plan.performanceIndicator,
    core_competencies: plan.coreCompetencies,
    teaching_resources: plan.teachingResources,
    keywords: plan.keywords,
    references_text: plan.references,
    phases: plan.phases,
    lesson_note: plan.lessonNote,
    duration: plan.duration,
  };
}
