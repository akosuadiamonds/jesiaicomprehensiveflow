import React, { createContext, useContext, useState, ReactNode } from 'react';
import SuperAdminLayout from './layout/SuperAdminLayout';
import SADashboard from './pages/SADashboard';
import SASchools from './pages/SASchools';
import SAUsers from './pages/SAUsers';
import SAPlans from './pages/SAPlans';
import SASubscriptions from './pages/SASubscriptions';
import SAInsights from './pages/SAInsights';

interface SuperAdminContextType {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export const useSuperAdmin = () => {
  const ctx = useContext(SuperAdminContext);
  if (!ctx) throw new Error('useSuperAdmin must be used within SuperAdminApp');
  return ctx;
};

const SuperAdminApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <SADashboard />;
      case 'schools': return <SASchools />;
      case 'users': return <SAUsers />;
      case 'plans': return <SAPlans />;
      case 'subscriptions': return <SASubscriptions />;
      case 'insights': return <SAInsights />;
      default: return <SADashboard />;
    }
  };

  return (
    <SuperAdminContext.Provider value={{ currentPage, setCurrentPage }}>
      <SuperAdminLayout>
        {renderPage()}
      </SuperAdminLayout>
    </SuperAdminContext.Provider>
  );
};

export default SuperAdminApp;
