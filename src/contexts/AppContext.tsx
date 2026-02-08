import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useFreePlanLock } from '@/hooks/useFreePlanLock';

type AppPage = 'dashboard' | 'planner' | 'test' | 'classroom' | 'insights' | 'profile';

interface AppContextType {
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;
  currentTerm: string;
  setCurrentTerm: (term: string) => void;
  isPageLocked: (page: string) => boolean;
  showUpgradePrompt: boolean;
  setShowUpgradePrompt: (show: boolean) => void;
  refreshLock: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [currentTerm, setCurrentTerm] = useState<string>('Term 1');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const { isPageLocked, refreshLock } = useFreePlanLock();

  const handleSetPage = (page: AppPage) => {
    if (isPageLocked(page)) {
      setShowUpgradePrompt(true);
      return;
    }
    setCurrentPage(page);
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage: handleSetPage,
        currentTerm,
        setCurrentTerm,
        isPageLocked,
        showUpgradePrompt,
        setShowUpgradePrompt,
        refreshLock,
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
