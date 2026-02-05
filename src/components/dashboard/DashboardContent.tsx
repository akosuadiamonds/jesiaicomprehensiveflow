import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import UpgradePlanModal from '@/components/upgrade/UpgradePlanModal';
import { 
  FileText, 
  HelpCircle, 
  Users, 
  BarChart3, 
  Plus,
  Sparkles
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const { setCurrentPage, savedLessonPlans } = useApp();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const selectedPlan = profile?.selected_plan || 'free';

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
    { icon: FileText, label: 'Create Lesson Plan', color: 'bg-primary/10 text-primary', onClick: () => setCurrentPage('planner') },
    { icon: HelpCircle, label: 'Generate Quiz', color: 'bg-accent/10 text-accent', onClick: () => setCurrentPage('test') },
    { icon: Users, label: 'View Classroom', color: 'bg-success/10 text-success', onClick: () => setCurrentPage('classroom') },
    { icon: BarChart3, label: 'Analytics', color: 'bg-primary/10 text-primary', onClick: () => setCurrentPage('insights') },
  ];

  const recentActivity = [
    { title: 'Welcome to Jesi AI!', time: 'Just now', type: 'notification' },
    { title: 'Profile completed', time: '2 minutes ago', type: 'achievement' },
    { title: `${selectedPlan === 'free' ? 'Free trial started' : 'Subscription activated'}`, time: '1 minute ago', type: 'subscription' },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Welcome back, {profile?.first_name || 'Teacher'}! 👋
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
            onClick={action.onClick}
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
                <Button 
                  variant="secondary" 
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  onClick={() => setCurrentPage('planner')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Lesson Plan
                </Button>
              </div>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="bg-card rounded-2xl border border-border p-6">
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
                <span className="text-muted-foreground text-sm">No subjects selected</span>
              )}
            </div>
          </div>

          {/* Saved Lesson Plans */}
          {savedLessonPlans.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Recent Lesson Plans</h3>
              <div className="space-y-3">
                {savedLessonPlans.slice(-3).map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{plan.subject} - {plan.class}</p>
                      <p className="text-sm text-muted-foreground">{plan.strand}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentPage('planner')}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowUpgradeModal(true)}>
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

      <UpgradePlanModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
};

export default DashboardContent;
