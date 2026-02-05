import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useApp } from '@/contexts/AppContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Search, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AppHeader: React.FC = () => {
  const { signupData, selectedPlan, signOut } = useOnboarding();
  const { setCurrentPage } = useApp();

  const getPlanBadge = () => {
    switch (selectedPlan) {
      case 'free':
        return { label: 'Free Trial', className: 'bg-muted text-muted-foreground' };
      case 'pro':
        return { label: 'Pro', className: 'gradient-hero text-primary-foreground' };
      case 'premium':
        return { label: 'Premium', className: 'gradient-premium text-foreground' };
      default:
        return { label: 'Free', className: 'bg-muted text-muted-foreground' };
    }
  };

  const badge = getPlanBadge();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50 h-16">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-9 w-9" />
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search lessons, quizzes..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:bg-muted p-2 rounded-lg transition-colors">
                <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center text-sm font-semibold text-primary-foreground">
                  {signupData.firstName?.[0]}{signupData.lastName?.[0]}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">
                    {signupData.firstName} {signupData.lastName}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setCurrentPage('profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
