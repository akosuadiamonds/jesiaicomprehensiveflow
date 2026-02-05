import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GeneratedLessonPlan } from '@/types/lesson';

type AppPage = 'dashboard' | 'planner' | 'test' | 'classroom' | 'insights';

interface AppContextType {
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;
  savedLessonPlans: GeneratedLessonPlan[];
  addLessonPlan: (plan: GeneratedLessonPlan) => void;
  updateLessonPlan: (id: string, plan: GeneratedLessonPlan) => void;
  deleteLessonPlan: (id: string) => void;
  currentTerm: string;
  setCurrentTerm: (term: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [savedLessonPlans, setSavedLessonPlans] = useState<GeneratedLessonPlan[]>([]);
  const [currentTerm, setCurrentTerm] = useState<string>('Term 1');

  const addLessonPlan = (plan: GeneratedLessonPlan) => {
    setSavedLessonPlans(prev => [...prev, plan]);
  };

  const updateLessonPlan = (id: string, plan: GeneratedLessonPlan) => {
    setSavedLessonPlans(prev => prev.map(p => p.id === id ? plan : p));
  };

  const deleteLessonPlan = (id: string) => {
    setSavedLessonPlans(prev => prev.filter(p => p.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        savedLessonPlans,
        addLessonPlan,
        updateLessonPlan,
        deleteLessonPlan,
        currentTerm,
        setCurrentTerm,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
