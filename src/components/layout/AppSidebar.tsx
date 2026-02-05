import React from 'react';
import { useApp } from '@/contexts/AppContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileQuestion, 
  Users, 
  BarChart3,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'planner' as const, label: 'Planner', icon: BookOpen },
  { id: 'test' as const, label: 'Test', icon: FileQuestion },
  { id: 'classroom' as const, label: 'Classroom', icon: Users },
  { id: 'insights' as const, label: 'Insights', icon: BarChart3 },
];

const AppSidebar: React.FC = () => {
  const { currentPage, setCurrentPage } = useApp();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

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
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setCurrentPage(item.id)}
                    className={cn(
                      "w-full justify-start gap-3 h-11 px-3 rounded-lg transition-all",
                      currentPage === item.id
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                    tooltip={item.label}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
