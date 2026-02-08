import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useFreePlanLock = () => {
  const { user, profile } = useAuth();
  const [hasGeneratedPlan, setHasGeneratedPlan] = useState(false);
  const [loading, setLoading] = useState(true);

  const isFreePlan = profile?.selected_plan === 'free' || !profile?.selected_plan;

  useEffect(() => {
    const checkGeneratedPlans = async () => {
      if (!user || !isFreePlan) {
        setLoading(false);
        return;
      }

      const { count, error } = await supabase
        .from('saved_lesson_plans')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id);

      if (!error) {
        setHasGeneratedPlan((count || 0) >= 1);
      }
      setLoading(false);
    };

    checkGeneratedPlans();
  }, [user, isFreePlan]);

  // Tabs are locked when user is on free plan AND has generated at least 1 plan
  const isLocked = isFreePlan && hasGeneratedPlan;

  // Which pages are locked
  const lockedPages = ['planner', 'test', 'classroom', 'insights'] as const;

  const isPageLocked = (page: string) => isLocked && lockedPages.includes(page as any);

  return { isLocked, isPageLocked, loading, refreshLock: () => setHasGeneratedPlan(true) };
};
