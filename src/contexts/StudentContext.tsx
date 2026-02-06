import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StudentPage } from '@/types/student';

interface StudentContextType {
  currentPage: StudentPage;
  setCurrentPage: (page: StudentPage) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<StudentPage>('learn');

  return (
    <StudentContext.Provider value={{ currentPage, setCurrentPage }}>
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
