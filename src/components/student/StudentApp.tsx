import React from 'react';
import { useStudent, StudentProvider } from '@/contexts/StudentContext';
import StudentLayout from '@/components/student/layout/StudentLayout';
import LearnZone from '@/components/student/zones/LearnZone';
import PracticeZone from '@/components/student/zones/PracticeZone';
import ClassZone from '@/components/student/zones/ClassZone';
import StreakZone from '@/components/student/zones/StreakZone';
import StudentInsightZone from '@/components/student/zones/StudentInsightZone';
import StudentProfilePage from '@/components/student/profile/StudentProfilePage';

const StudentAppContent: React.FC = () => {
  const { currentPage } = useStudent();

  const renderPage = () => {
    switch (currentPage) {
      case 'learn':
        return <LearnZone />;
      case 'practice':
        return <PracticeZone />;
      case 'class':
        return <ClassZone />;
      case 'streak':
        return <StreakZone />;
      case 'insights':
        return <StudentInsightZone />;
      case 'profile':
        return <StudentProfilePage />;
      default:
        return <LearnZone />;
    }
  };

  return (
    <StudentLayout>
      {renderPage()}
    </StudentLayout>
  );
};

const StudentApp: React.FC = () => {
  return (
    <StudentProvider>
      <StudentAppContent />
    </StudentProvider>
  );
};

export default StudentApp;
