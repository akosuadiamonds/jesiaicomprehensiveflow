import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Copy, 
  MoreVertical, 
  Trash2, 
  Eye, 
  School, 
  Briefcase,
  BookOpen 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Classroom } from '@/types/classroom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ClassroomCardProps {
  classroom: Classroom;
  onView: (classroom: Classroom) => void;
  onDelete: (classroomId: string) => void;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({ classroom, onView, onDelete }) => {
  const { toast } = useToast();
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    const fetchStudentCount = async () => {
      const { count } = await supabase
        .from('classroom_students')
        .select('*', { count: 'exact', head: true })
        .eq('classroom_id', classroom.id)
        .eq('is_active', true);
      setStudentCount(count || 0);
    };
    fetchStudentCount();
  }, [classroom.id]);

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${classroom.invite_code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied!',
      description: 'Shareable invite link copied to clipboard',
    });
  };

  const isPrivate = classroom.classroom_type === 'private';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isPrivate ? 'bg-primary/10' : 'bg-secondary'
            }`}>
              {isPrivate ? (
                <Briefcase className="w-5 h-5 text-primary" />
              ) : (
                <School className="w-5 h-5 text-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground line-clamp-1">{classroom.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {classroom.subject}
                </Badge>
                {isPrivate && classroom.monthly_fee > 0 && (
                  <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                    GHS {classroom.monthly_fee}/{classroom.fee_frequency === 'daily' ? 'day' : classroom.fee_frequency === 'weekly' ? 'wk' : 'mo'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(classroom)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(classroom.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {classroom.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {classroom.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{studentCount} / {classroom.max_students}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm font-mono">
              <span>{classroom.invite_code}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={copyInviteLink}
                title="Copy invite link"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => onView(classroom)}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Open Classroom
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClassroomCard;
