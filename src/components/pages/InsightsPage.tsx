import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  BookOpen, 
  GraduationCap,
  Calendar,
  Target,
  Award,
  Clock,
  Sparkles,
  School,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLessonPlans } from '@/hooks/useLessonPlans';
import { useClassrooms } from '@/hooks/useClassrooms';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartConfig 
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const InsightsPage: React.FC = () => {
  const { profile } = useAuth();
  const { plans: savedLessonPlans } = useLessonPlans();
  const { classrooms, schoolClassrooms, privateClassrooms } = useClassrooms();

  // Calculate metrics
  const totalLessonPlans = savedLessonPlans.length;
  const totalClassrooms = classrooms.length;
  const totalSchoolClasses = schoolClassrooms.length;
  const totalPrivateClasses = privateClassrooms.length;
  const subjectsCount = profile?.subjects?.length || 0;

  // Mock data for charts (in production, this would come from the database)
  const weeklyActivityData = [
    { day: 'Mon', plans: 2, tests: 1, resources: 3 },
    { day: 'Tue', plans: 3, tests: 2, resources: 1 },
    { day: 'Wed', plans: 1, tests: 0, resources: 2 },
    { day: 'Thu', plans: 4, tests: 3, resources: 4 },
    { day: 'Fri', plans: 2, tests: 1, resources: 2 },
    { day: 'Sat', plans: 0, tests: 0, resources: 0 },
    { day: 'Sun', plans: 1, tests: 0, resources: 1 },
  ];

  const subjectDistribution = profile?.subjects?.map((subject, index) => ({
    name: subject,
    value: Math.floor(Math.random() * 10) + 1, // Mock data
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  })) || [];

  const classroomTypeData = [
    { name: 'School', value: totalSchoolClasses, fill: 'hsl(var(--primary))' },
    { name: 'Private', value: totalPrivateClasses, fill: 'hsl(var(--accent))' },
  ];

  const monthlyTrendData = [
    { month: 'Sep', plans: 5, tests: 3, students: 12 },
    { month: 'Oct', plans: 8, tests: 5, students: 18 },
    { month: 'Nov', plans: 12, tests: 7, students: 25 },
    { month: 'Dec', plans: 6, tests: 4, students: 28 },
    { month: 'Jan', plans: 15, tests: 9, students: 35 },
    { month: 'Feb', plans: totalLessonPlans || 3, tests: 2, students: 40 },
  ];

  const chartConfig: ChartConfig = {
    plans: { label: 'Lesson Plans', color: 'hsl(var(--primary))' },
    tests: { label: 'Tests', color: 'hsl(var(--accent))' },
    resources: { label: 'Resources', color: 'hsl(var(--chart-3))' },
    students: { label: 'Students', color: 'hsl(var(--chart-4))' },
  };

  // Stats cards data
  const statCards = [
    {
      title: 'Lesson Plans',
      value: totalLessonPlans,
      subtitle: 'Total created',
      icon: FileText,
      color: 'bg-primary/10 text-primary',
      trend: '+12% this month',
      trendUp: true,
    },
    {
      title: 'Classrooms',
      value: totalClassrooms,
      subtitle: `${totalSchoolClasses} school · ${totalPrivateClasses} private`,
      icon: Users,
      color: 'bg-accent/10 text-accent',
      trend: `${totalClassrooms} active`,
      trendUp: true,
    },
    {
      title: 'Tests Created',
      value: 12, // Mock - would come from DB
      subtitle: '3 quizzes, 6 tests, 3 exams',
      icon: GraduationCap,
      color: 'bg-success/10 text-success',
      trend: '+5 this week',
      trendUp: true,
    },
    {
      title: 'Subjects',
      value: subjectsCount,
      subtitle: 'Teaching areas',
      icon: BookOpen,
      color: 'bg-primary/10 text-primary',
      trend: 'Active',
      trendUp: true,
    },
  ];

  // AI Suggestions based on activity
  const aiSuggestions = [
    {
      title: 'Create more Science content',
      description: 'Your Science lessons have the highest student engagement. Consider creating more resources.',
      priority: 'high',
    },
    {
      title: 'Weekly quiz routine',
      description: 'Classes with weekly quizzes show 40% better retention. Try adding a quiz schedule.',
      priority: 'medium',
    },
    {
      title: 'Expand private tutoring',
      description: 'Your private class has room for more students. Share your invite code to grow.',
      priority: 'low',
    },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Insights & Analytics
        </h1>
        <p className="text-muted-foreground">
          Track your teaching progress and get AI-powered recommendations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-xs text-success">
                  <TrendingUp className="w-3 h-3" />
                  <span>{stat.trend}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm font-medium text-foreground">{stat.title}</p>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Charts Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Weekly Activity
              </CardTitle>
              <CardDescription>Your content creation this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px]">
                <BarChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="plans" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tests" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resources" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                  <span className="text-muted-foreground">Lesson Plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-accent" />
                  <span className="text-muted-foreground">Tests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
                  <span className="text-muted-foreground">Resources</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Growth Trend
              </CardTitle>
              <CardDescription>Your progress over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px]">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="plans" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tests" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="students" 
                    stroke="hsl(var(--chart-4))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-4))' }}
                  />
                </LineChart>
              </ChartContainer>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Tests</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-4))' }} />
                  <span className="text-muted-foreground">Students</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Classroom Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <School className="w-4 h-4" />
                Classroom Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalClassrooms > 0 ? (
                <>
                  <ChartContainer config={chartConfig} className="h-[160px]">
                    <PieChart>
                      <Pie
                        data={classroomTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {classroomTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-muted-foreground">School ({totalSchoolClasses})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      <span className="text-muted-foreground">Private ({totalPrivateClasses})</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No classrooms yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subject Coverage */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Subject Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile?.subjects && profile.subjects.length > 0 ? (
                profile.subjects.map((subject, index) => {
                  const progress = Math.floor(Math.random() * 40) + 60; // Mock progress
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{subject}</span>
                        <span className="text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No subjects selected
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded-lg bg-background/80 border border-border/50"
                >
                  <div className="flex items-start gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        suggestion.priority === 'high' 
                          ? 'border-primary text-primary' 
                          : suggestion.priority === 'medium'
                          ? 'border-accent text-accent'
                          : 'border-muted-foreground text-muted-foreground'
                      }`}
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">{suggestion.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{totalLessonPlans}</p>
                  <p className="text-xs text-muted-foreground">Plans Created</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-accent">12</p>
                  <p className="text-xs text-muted-foreground">Tests Generated</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-success">40</p>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{totalClassrooms}</p>
                  <p className="text-xs text-muted-foreground">Active Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
