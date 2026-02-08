import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Users, CheckCircle2, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const JoinClassContent: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [classroom, setClassroom] = useState<any>(null);
  const [teacherName, setTeacherName] = useState('');
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!inviteCode) return;
    const fetchClassroom = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setClassroom(data);

      // Fetch teacher name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', data.teacher_id)
        .single();

      if (profile) {
        setTeacherName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim());
      }

      // Fetch student count
      const { count } = await supabase
        .from('classroom_students')
        .select('*', { count: 'exact', head: true })
        .eq('classroom_id', data.id)
        .eq('is_active', true);

      setStudentCount(count || 0);

      // Check if current user already joined
      if (user) {
        const { data: existing } = await supabase
          .from('classroom_students')
          .select('id')
          .eq('classroom_id', data.id)
          .eq('student_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        setAlreadyJoined(!!existing);
      }

      setLoading(false);
    };

    fetchClassroom();
  }, [inviteCode, user]);

  const handleJoin = async () => {
    if (!user || !classroom) return;
    setJoining(true);

    const { error } = await supabase
      .from('classroom_students')
      .insert({
        classroom_id: classroom.id,
        student_id: user.id,
      });

    if (error) {
      toast.error('Failed to join class. Please try again.');
      console.error('Join error:', error);
    } else {
      toast.success(`You've joined ${classroom.name}! 🎉`);
      setAlreadyJoined(true);
    }
    setJoining(false);
  };

  const handleGoToSignup = () => {
    // Store invite code so we can auto-join after onboarding
    localStorage.setItem('jesi_pending_invite', inviteCode?.toUpperCase() || '');
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8 space-y-4">
            <div className="text-5xl">🔍</div>
            <h2 className="text-xl font-bold text-foreground">Class Not Found</h2>
            <p className="text-muted-foreground text-sm">
              The invite code <span className="font-mono font-bold">{inviteCode}</span> is invalid or the class is no longer active.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPrivate = classroom?.classroom_type === 'private';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md overflow-hidden">
        {/* Header banner */}
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground text-center">
          <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold">You're Invited!</h1>
          <p className="text-sm opacity-90 mt-1">Join this class on Jesi AI</p>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Class info */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">{classroom?.name}</h2>
            {classroom?.description && (
              <p className="text-sm text-muted-foreground">{classroom.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{classroom?.subject}</Badge>
              {isPrivate && classroom?.monthly_fee > 0 && (
                <Badge className="bg-primary/10 text-primary">
                  GHS {classroom.monthly_fee}/mo
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {teacherName && <span>👨‍🏫 {teacherName}</span>}
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {studentCount} student{studentCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Action */}
          {alreadyJoined ? (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium text-sm">You're already in this class!</span>
            </div>
          ) : user ? (
            <Button className="w-full gap-2" size="lg" onClick={handleJoin} disabled={joining}>
              {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {joining ? 'Joining...' : 'Join Class'}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-center text-muted-foreground">
                Create an account or sign in to join this class
              </p>
              <Button className="w-full gap-2" size="lg" onClick={handleGoToSignup}>
                <UserPlus className="w-4 h-4" />
                Create Account & Join
              </Button>
              <Button variant="outline" className="w-full" onClick={handleGoToSignup}>
                I already have an account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const JoinClassPage: React.FC = () => (
  <AuthProvider>
    <OnboardingProvider>
      <JoinClassContent />
    </OnboardingProvider>
  </AuthProvider>
);

export default JoinClassPage;
