import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useStudent } from '@/contexts/StudentContext';
import {
  BookOpen,
  Dumbbell,
  Users,
  Flame,
  BarChart3,
  Sparkles,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { setCurrentPage } = useStudent();

  const firstName = profile?.first_name || 'Learner';
  const classGrade = (profile as any)?.class_grade || 'JHS 1';
  const selectedPlan = profile?.selected_plan || 'free';

  const getPlanBadge = () => {
    switch (selectedPlan) {
      case 'free':
        return { label: 'Explorer', className: 'bg-muted text-muted-foreground' };
      case 'pro':
        return { label: 'Achiever', className: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' };
      case 'premium':
        return { label: 'Champion', className: 'bg-gradient-to-r from-emerald-400 to-green-500 text-white' };
      default:
        return { label: 'Explorer', className: 'bg-muted text-muted-foreground' };
    }
  };

  const badge = getPlanBadge();

  const quickActions = [
    { icon: BookOpen, label: 'Start Learning', emoji: '📚', color: 'from-blue-400 to-blue-600', onClick: () => setCurrentPage('learn') },
    { icon: Dumbbell, label: 'Practice Now', emoji: '💪', color: 'from-green-400 to-green-600', onClick: () => setCurrentPage('practice') },
    { icon: Users, label: 'My Classes', emoji: '🏫', color: 'from-purple-400 to-purple-600', onClick: () => setCurrentPage('class') },
    { icon: BarChart3, label: 'My Progress', emoji: '📊', color: 'from-amber-400 to-orange-500', onClick: () => setCurrentPage('insights') },
  ];

  const tips = [
    "📖 Read your lesson notes before attempting homework",
    "🎯 Try practice questions daily to build confidence",
    "🔥 Keep your streak going for bonus coins!",
    "🤖 Use Jesi AI to help explain tough topics",
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="text-muted-foreground">
                Class: <strong>{classGrade}</strong> • Ready to learn something new today?
              </p>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${badge.className}`}>
              {badge.label}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="p-5 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300 text-left group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-white shadow-md`}>
              <action.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">{action.label}</h3>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI-Powered CTA */}
          <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">AI-Powered Learning</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Continue Your Learning Journey</h2>
              <p className="opacity-90 mb-4 max-w-md text-sm">
                Explore subjects, practice with AI-generated questions, and track your progress — all tailored to your level.
              </p>
              <Button
                variant="secondary"
                className="bg-white text-amber-600 hover:bg-white/90"
                onClick={() => setCurrentPage('learn')}
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Go to Learn Zone
              </Button>
            </CardContent>
          </Card>

          {/* Subjects */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Your Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {profile?.subjects && profile.subjects.length > 0 ? (
                  profile.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm"
                    >
                      {subject}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">Subjects are assigned based on your class level</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Streak Preview */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentPage('streak')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">My Streak</h3>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">🔥</span>
                <span className="text-2xl font-bold">5 days</span>
              </div>
              <p className="text-xs text-muted-foreground">Keep it going to earn bonus coins!</p>
              <Button variant="ghost" size="sm" className="w-full mt-3 gap-1">
                View Streak Zone <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Study Tips
              </h3>
              <div className="space-y-2">
                {tips.map((tip, index) => (
                  <p key={index} className="text-sm text-muted-foreground">{tip}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
