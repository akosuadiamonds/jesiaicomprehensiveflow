import React from 'react';
import { useApp, AppProvider } from '@/contexts/AppContext';
import AppLayout from '@/components/layout/AppLayout';
import DashboardContent from '@/components/dashboard/DashboardContent';
import PlannerPage from '@/components/planner/PlannerPage';
import TestPage from '@/components/pages/TestPage';
import ClassroomPage from '@/components/pages/ClassroomPage';
import InsightsPage from '@/components/pages/InsightsPage';
import ProfilePage from '@/components/profile/ProfilePage';
import UpgradePromptModal from '@/components/upgrade/UpgradePromptModal';

const MainAppContent: React.FC = () => {
  const { currentPage, showUpgradePrompt, setShowUpgradePrompt } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardContent />;
      case 'planner':
        return <PlannerPage />;
      case 'test':
        return <TestPage />;
      case 'classroom':
        return <ClassroomPage />;
      case 'insights':
        return <InsightsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <AppLayout>
      {renderPage()}
      <UpgradePromptModal open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt} />
    </AppLayout>
  );
};

const MainApp: React.FC = () => {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
};

export default MainApp;
