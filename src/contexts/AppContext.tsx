import React, { createContext, useContext, useState, ReactNode } from 'react';

type AppPage = 'dashboard' | 'planner' | 'test' | 'classroom' | 'insights' | 'profile';

interface AppContextType {
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;
  currentTerm: string;
  setCurrentTerm: (term: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [currentTerm, setCurrentTerm] = useState<string>('Term 1');

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
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
