import React from 'react';
import { useStudent } from '@/contexts/StudentContext';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  BookOpen, 
  Dumbbell, 
  Users, 
  Flame,
  BarChart3,
  LogOut,
  Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: BookOpen, emoji: '🏠' },
  { id: 'learn' as const, label: 'Learn Zone', icon: BookOpen, emoji: '📚' },
  { id: 'practice' as const, label: 'Practice Zone', icon: Dumbbell, emoji: '💪' },
  { id: 'class' as const, label: 'Class Zone', icon: Users, emoji: '🏫' },
  { id: 'streak' as const, label: 'Streak Zone', icon: Flame, emoji: '🔥' },
  { id: 'insights' as const, label: 'Insight Zone', icon: BarChart3, emoji: '📊' },
];

const StudentSidebar: React.FC = () => {
  const { currentPage, setCurrentPage } = useStudent();
  const { signOut, profile } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const handleSignOut = () => {
    signOut();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Jesi AI" className="w-8 h-8 object-contain shrink-0" />
          {!collapsed && (
            <img src={logo} alt="Jesi AI" className="h-7 object-contain" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setCurrentPage(item.id)}
                    className={cn(
                      "w-full justify-start gap-3 h-12 px-3 rounded-xl transition-all",
                      currentPage === item.id
                        ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                    tooltip={item.label}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Separator className="mb-2" />
        {!collapsed && profile?.first_name && (
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {profile.first_name} {profile.last_name}
            </span>
            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
              <Coins className="w-3 h-3 mr-1" />
              0
            </Badge>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="w-full justify-start gap-3 h-11 px-3 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
              tooltip="Sign Out"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="font-medium">Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default StudentSidebar;
