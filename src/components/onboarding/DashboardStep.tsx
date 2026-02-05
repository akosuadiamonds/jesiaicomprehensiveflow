import React from 'react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { 
  GraduationCap, 
  FileText, 
  HelpCircle, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  Sparkles,
  Bell,
  Search
} from 'lucide-react';

const DashboardStep: React.FC = () => {
  const { signupData, selectedPlan, teacherProfile } = useOnboarding();

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

  const quickActions = [
    { icon: FileText, label: 'Create Lesson Plan', color: 'bg-primary/10 text-primary' },
    { icon: HelpCircle, label: 'Generate Quiz', color: 'bg-accent/10 text-accent' },
    { icon: Users, label: 'View Students', color: 'bg-success/10 text-success' },
    { icon: BarChart3, label: 'Analytics', color: 'bg-primary/10 text-primary' },
  ];

  const recentActivity = [
    { title: 'Welcome to Jesi AI!', time: 'Just now', type: 'notification' },
    { title: 'Profile completed', time: '2 minutes ago', type: 'achievement' },
    { title: `${selectedPlan === 'free' ? 'Free trial started' : 'Subscription activated'}`, time: '1 minute ago', type: 'subscription' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Jesi AI</span>
            </div>

            <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search lessons, quizzes..."
                  className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full gradient-hero flex items-center justify-center text-sm font-semibold text-primary-foreground">
                  {signupData.firstName?.[0]}{signupData.lastName?.[0]}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-foreground">
                    {signupData.firstName} {signupData.lastName}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Welcome back, {signupData.firstName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to create something amazing today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="p-6 rounded-2xl bg-card border border-border hover:shadow-medium transition-all duration-300 text-left group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground">{action.label}</h3>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create New Card */}
            <div className="gradient-hero rounded-2xl p-6 text-primary-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">AI-Powered</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Create Your First Lesson</h2>
                  <p className="opacity-90 mb-4 max-w-md">
                    Let AI help you create engaging lesson plans aligned with GES curriculum in minutes.
                  </p>
                  <Button variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                    <Plus className="w-4 h-4" />
                    New Lesson Plan
                  </Button>
                </div>
              </div>
            </div>

            {/* Subjects Grid */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Your Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {teacherProfile.subjects?.map((subject, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Status */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Your Plan</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-3 ${badge.className}`}>
                {badge.label}
              </div>
              {selectedPlan === 'free' && (
                <p className="text-sm text-muted-foreground mb-4">
                  4 days remaining in your trial
                </p>
              )}
              {selectedPlan !== 'premium' && (
                <Button variant="outline" size="sm" className="w-full">
                  Upgrade Plan
                </Button>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardStep;
