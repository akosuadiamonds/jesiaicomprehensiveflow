import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSuperAdmin } from '../SuperAdminApp';
import { Shield, LayoutDashboard, School, Users, CreditCard, BarChart3, Package, LogOut, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'schools', label: 'Schools', icon: School },
  { id: 'plans', label: 'Plans', icon: Package },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'financials', label: 'Financials', icon: DollarSign },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
];

const SuperAdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut, profile } = useAuth();
  const { currentPage, setCurrentPage } = useSuperAdmin();

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive flex items-center justify-center">
              <Shield className="w-5 h-5 text-destructive-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">Jesi AI</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                currentPage === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground text-xs font-bold">
              SA
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.first_name || 'Super'} {profile?.last_name || 'Admin'}
              </p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
