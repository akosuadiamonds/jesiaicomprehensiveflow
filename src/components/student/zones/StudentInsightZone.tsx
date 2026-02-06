import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Clock,
  Brain,
  Award,
  Lightbulb,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const weeklyActivity = [
  { day: 'Mon', lessons: 3, practice: 25, time: 45 },
  { day: 'Tue', lessons: 2, practice: 30, time: 50 },
  { day: 'Wed', lessons: 4, practice: 40, time: 75 },
  { day: 'Thu', lessons: 1, practice: 15, time: 30 },
  { day: 'Fri', lessons: 3, practice: 35, time: 60 },
  { day: 'Sat', lessons: 0, practice: 10, time: 15 },
  { day: 'Sun', lessons: 2, practice: 20, time: 40 },
];

const subjectPerformance = [
  { subject: 'Math', score: 85, color: '#3B82F6' },
  { subject: 'English', score: 78, color: '#10B981' },
  { subject: 'Science', score: 72, color: '#8B5CF6' },
  { subject: 'Social', score: 90, color: '#F59E0B' },
  { subject: 'ICT', score: 65, color: '#06B6D4' },
];

const skillsData = [
  { skill: 'Problem Solving', value: 75 },
  { skill: 'Reading', value: 85 },
  { skill: 'Critical Thinking', value: 70 },
  { skill: 'Memory', value: 80 },
  { skill: 'Creativity', value: 65 },
  { skill: 'Focus', value: 72 },
];

const progressTrend = [
  { week: 'Week 1', score: 65 },
  { week: 'Week 2', score: 70 },
  { week: 'Week 3', score: 68 },
  { week: 'Week 4', score: 75 },
  { week: 'Week 5', score: 78 },
  { week: 'Week 6', score: 82 },
];

const StudentInsightZone: React.FC = () => {
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-3xl">📊</span>
          Your Learning Insights
        </h2>
        <p className="text-muted-foreground">Track your progress and discover your strengths</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Lessons This Week', value: '15', change: '+3', positive: true, icon: BookOpen },
          { label: 'Questions Solved', value: '175', change: '+25', positive: true, icon: Target },
          { label: 'Study Hours', value: '8.5h', change: '+1.2h', positive: true, icon: Clock },
          { label: 'Average Score', value: '78%', change: '+5%', positive: true, icon: Award },
        ].map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <stat.icon className="w-5 h-5 text-primary" />
                <Badge 
                  variant="outline" 
                  className={stat.positive ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}
                >
                  {stat.positive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Weekly Activity
            </CardTitle>
            <CardDescription>Your learning activity over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="practice" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Practice Questions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Progress Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Performance Trend
            </CardTitle>
            <CardDescription>Your average score progression</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressTrend}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>How you're doing in each subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformance.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{subject.subject}</span>
                    <span className="text-sm font-bold" style={{ color: subject.color }}>
                      {subject.score}%
                    </span>
                  </div>
                  <Progress 
                    value={subject.score} 
                    className="h-2"
                    style={{ '--progress-color': subject.color } as any}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Overview</CardTitle>
            <CardDescription>Your learning skills assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={skillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>Based on your learning patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: '📚 Focus on ICT',
                desc: 'Your ICT score is 65%. Try spending 15 more minutes daily on ICT practice.',
                priority: 'high'
              },
              {
                title: '⏰ Best Study Time',
                desc: 'You perform 20% better in the morning. Schedule important topics before noon!',
                priority: 'medium'
              },
              {
                title: '🎯 Practice More Math',
                desc: 'You solved 40% fewer math questions this week. Keep the momentum going!',
                priority: 'medium'
              },
              {
                title: '🔥 Streak Goal',
                desc: 'You\'re 2 days away from your longest streak! Log in daily to achieve it.',
                priority: 'low'
              },
            ].map((rec, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg bg-background/50 border border-border/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{rec.title}</h4>
                  <Badge 
                    variant="outline"
                    className={
                      rec.priority === 'high' ? 'border-red-300 text-red-600' :
                      rec.priority === 'medium' ? 'border-amber-300 text-amber-600' :
                      'border-green-300 text-green-600'
                    }
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentInsightZone;
