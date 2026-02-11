import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
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
  LayoutDashboard, 
  BookOpen, 
  FileQuestion, 
  Users, 
  BarChart3,
  GraduationCap,
  LogOut,
  Lock,
  DollarSign,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const AppSidebar: React.FC = () => {
  const { currentPage, setCurrentPage, isPageLocked } = useApp();
  const { signOut, profile } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [classroomExpanded, setClassroomExpanded] = useState(false);

  const isPremium = profile?.selected_plan === 'premium';

  const topItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner' as const, label: 'Planner', icon: BookOpen },
    { id: 'test' as const, label: 'Test', icon: FileQuestion },
  ];

  const bottomItems = [
    { id: 'insights' as const, label: 'Insights', icon: BarChart3 },
  ];

  const handleSignOut = () => {
    signOut();
  };

  const renderMenuItem = (item: { id: string; label: string; icon: any }) => {
    const locked = isPageLocked(item.id);
    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          onClick={() => setCurrentPage(item.id as any)}
          className={cn(
            "w-full justify-start gap-3 h-11 px-3 rounded-lg transition-all",
            currentPage === item.id
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : locked
              ? "hover:bg-muted text-muted-foreground/50 hover:text-muted-foreground"
              : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
          tooltip={locked ? `${item.label} (Locked - Upgrade to access)` : item.label}
        >
          <item.icon className="w-5 h-5 shrink-0" />
          {!collapsed && (
            <span className="font-medium flex items-center gap-2">
              {item.label}
              {locked && <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />}
            </span>
          )}
          {collapsed && locked && (
            <Lock className="w-3 h-3 absolute top-1 right-1 text-muted-foreground/60" />
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-foreground">Jesi AI</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {topItems.map(renderMenuItem)}

              {/* Classroom with expandable submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    if (collapsed) {
                      setCurrentPage('classroom');
                    } else {
                      setClassroomExpanded(!classroomExpanded);
                      setCurrentPage('classroom');
                    }
                  }}
                  className={cn(
                    "w-full justify-start gap-3 h-11 px-3 rounded-lg transition-all",
                    currentPage === 'classroom'
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  tooltip="Classroom"
                >
                  <Users className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <span className="font-medium flex-1 flex items-center justify-between">
                      Classroom
                      {classroomExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Monetization sub-item */}
              {!collapsed && classroomExpanded && isPremium && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setCurrentPage('classroom')}
                    className={cn(
                      "w-full justify-start gap-3 h-9 pl-10 pr-3 rounded-lg transition-all text-sm",
                      "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                    tooltip="Monetization"
                  >
                    <DollarSign className="w-4 h-4 shrink-0" />
                    <span className="font-medium">Monetization</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {bottomItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Separator className="mb-2" />
        {!collapsed && profile?.first_name && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            {profile.first_name} {profile.last_name}
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

export default AppSidebar;
