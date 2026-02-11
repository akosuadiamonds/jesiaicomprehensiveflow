import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StudentPage } from '@/types/student';

interface PracticeNavigation {
  subject?: string;
  topic?: string;
}

interface StudentContextType {
  currentPage: StudentPage;
  setCurrentPage: (page: StudentPage) => void;
  practiceNavigation: PracticeNavigation | null;
  navigateToPractice: (subject?: string, topic?: string) => void;
  clearPracticeNavigation: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<StudentPage>('learn');
  const [practiceNavigation, setPracticeNavigation] = useState<PracticeNavigation | null>(null);

  const navigateToPractice = (subject?: string, topic?: string) => {
    setPracticeNavigation({ subject, topic });
    setCurrentPage('practice');
  };

  const clearPracticeNavigation = () => {
    setPracticeNavigation(null);
  };

  return (
    <StudentContext.Provider value={{ currentPage, setCurrentPage, practiceNavigation, navigateToPractice, clearPracticeNavigation }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
