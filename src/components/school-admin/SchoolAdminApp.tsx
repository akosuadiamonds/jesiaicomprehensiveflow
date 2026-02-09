import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import SchoolAdminLayout from './layout/SchoolAdminLayout';
import AdminDashboard from './dashboard/AdminDashboard';
import AdminManageUsers from './dashboard/AdminManageUsers';
import AdminSettings from './dashboard/AdminSettings';
import AdminInsights from './dashboard/AdminInsights';

interface Institution {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  region: string | null;
  phone: string | null;
  email: string | null;
  selected_plan: string;
  total_teacher_slots: number;
  total_student_slots: number;
}

interface AdminContextType {
  institution: Institution | null;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  refreshInstitution: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within SchoolAdminApp');
  return ctx;
};

const SchoolAdminApp: React.FC = () => {
  const { user } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const fetchInstitution = async () => {
    if (!user) return;
    // Find institution where this user is an admin member
    const { data: membership } = await supabase
      .from('institution_members' as any)
      .select('institution_id')
      .eq('user_id', user.id)
      .eq('member_role', 'admin')
      .single();

    if (membership) {
      const { data } = await supabase
        .from('institutions' as any)
        .select('*')
        .eq('id', (membership as any).institution_id)
        .single();

      if (data) {
        setInstitution(data as any);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInstitution();
  }, [user]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminManageUsers />;
      case 'insights':
        return <AdminInsights />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ institution, currentPage, setCurrentPage, refreshInstitution: fetchInstitution }}>
      <SchoolAdminLayout>
        {renderPage()}
      </SchoolAdminLayout>
    </AdminContext.Provider>
  );
};

export default SchoolAdminApp;
