import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, BookOpen, CheckCircle, Clock, UserPlus, Check, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'lesson' | 'success' | 'reminder' | 'join_request';
  meta?: {
    enrollmentId?: string;
    studentName?: string;
    classroomName?: string;
  };
}

const NotificationPopover: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const isTeacher = profile?.user_role === 'teacher';

  useEffect(() => {
    if (isTeacher && user) {
      fetchPendingRequests();
    } else {
      setNotifications([
        {
          id: '1', title: 'Lesson Plan Ready',
          message: 'Your lesson plan has been generated.',
          time: '2 min ago', read: false, type: 'lesson',
        },
      ]);
    }
  }, [user, isTeacher]);

  const fetchPendingRequests = async () => {
    if (!user) return;

    // Get teacher's classrooms
    const { data: classrooms } = await supabase
      .from('classrooms')
      .select('id, name')
      .eq('teacher_id', user.id);

    if (!classrooms || classrooms.length === 0) {
      setNotifications([]);
      return;
    }

    const classroomIds = classrooms.map(c => c.id);
    const classroomMap: Record<string, string> = {};
    classrooms.forEach(c => { classroomMap[c.id] = c.name; });

    // Get pending students
    const { data: pending } = await supabase
      .from('classroom_students')
      .select('id, student_id, classroom_id, joined_at')
      .in('classroom_id', classroomIds)
      .eq('approval_status', 'pending');

    if (!pending || pending.length === 0) {
      setNotifications([]);
      return;
    }

    // Get student profiles
    const studentIds = pending.map(p => p.student_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', studentIds);

    const profileMap: Record<string, string> = {};
    profiles?.forEach(p => {
      profileMap[p.user_id] = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Student';
    });

    const joinNotifications: Notification[] = pending.map(p => {
      const studentName = profileMap[p.student_id] || 'A student';
      const classroomName = classroomMap[p.classroom_id] || 'your class';
      const timeDiff = Date.now() - new Date(p.joined_at).getTime();
      const minutes = Math.floor(timeDiff / 60000);
      const timeStr = minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.floor(minutes / 60)}h ago` : `${Math.floor(minutes / 1440)}d ago`;

      return {
        id: p.id,
        title: 'Join Request',
        message: `${studentName} wants to join ${classroomName}`,
        time: timeStr,
        read: false,
        type: 'join_request' as const,
        meta: {
          enrollmentId: p.id,
          studentName,
          classroomName,
        },
      };
    });

    setNotifications(joinNotifications);
  };

  const handleApprove = async (enrollmentId: string) => {
    const { error } = await supabase
      .from('classroom_students')
      .update({ approval_status: 'approved' })
      .eq('id', enrollmentId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to approve student', variant: 'destructive' });
    } else {
      toast({ title: 'Approved', description: 'Student has been approved' });
      setNotifications(prev => prev.filter(n => n.id !== enrollmentId));
    }
  };

  const handleReject = async (enrollmentId: string) => {
    const { error } = await supabase
      .from('classroom_students')
      .delete()
      .eq('id', enrollmentId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to reject student', variant: 'destructive' });
    } else {
      toast({ title: 'Rejected', description: 'Student request rejected' });
      setNotifications(prev => prev.filter(n => n.id !== enrollmentId));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-4 h-4 text-primary" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-accent-foreground" />;
      case 'reminder': return <Clock className="w-4 h-4 text-secondary-foreground" />;
      case 'join_request': return <UserPlus className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      
                      {notification.type === 'join_request' && notification.meta?.enrollmentId && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="default" className="h-7 text-xs gap-1"
                            onClick={() => handleApprove(notification.meta!.enrollmentId!)}>
                            <Check className="w-3 h-3" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                            onClick={() => handleReject(notification.meta!.enrollmentId!)}>
                            <X className="w-3 h-3" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                    {!notification.read && notification.type !== 'join_request' && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;
