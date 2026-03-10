import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Users, TrendingDown, ThumbsUp, Clock, Monitor } from 'lucide-react';
import AnalyticsFilters, { FilterType } from './AnalyticsFilters';

const PlatformAnalytics: React.FC = () => {
  const [demoFilters, setDemoFilters] = useState<Record<string, string>>({});
  const [peakFilters, setPeakFilters] = useState<Record<string, string>>({});
  const [deviceFilters, setDeviceFilters] = useState<Record<string, string>>({});

  const handleDemoChange = (type: string, value: string) => setDemoFilters(p => ({ ...p, [type]: value }));
  const handlePeakChange = (type: string, value: string) => setPeakFilters(p => ({ ...p, [type]: value }));
  const handleDeviceChange = (type: string, value: string) => setDeviceFilters(p => ({ ...p, [type]: value }));

  const growthData = [
    { month: 'Jan', learners: 80, teachers: 30, schools: 10 },
    { month: 'Feb', learners: 120, teachers: 45, schools: 15 },
    { month: 'Mar', learners: 170, teachers: 55, schools: 25 },
    { month: 'Apr', learners: 210, teachers: 65, schools: 35 },
    { month: 'May', learners: 280, teachers: 80, schools: 40 },
    { month: 'Jun', learners: 340, teachers: 95, schools: 45 },
  ];

  const peakData = [
    { time: '6am', users: 10 }, { time: '8am', users: 45 }, { time: '10am', users: 80 },
    { time: '12pm', users: 65 }, { time: '2pm', users: 70 }, { time: '4pm', users: 55 },
    { time: '6pm', users: 40 }, { time: '8pm', users: 30 }, { time: '10pm', users: 15 },
  ];

  const deviceData = [
    { device: 'Mobile', students: 65, teachers: 40, admins: 20 },
    { device: 'Desktop', students: 25, teachers: 50, admins: 70 },
    { device: 'Tablet', students: 10, teachers: 10, admins: 10 },
  ];

  const demoFilterTypes: FilterType[] = ['school', 'district', 'region'];
  const userTypeFilterTypes: FilterType[] = ['school', 'district', 'region'];

  return (
    <div className="space-y-6">
      {/* User Demographics & Reach */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold text-foreground">User Demographics & Reach</h3>
          <AnalyticsFilters filters={demoFilterTypes} values={demoFilters} onChange={handleDemoChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Reach</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">1,245</div><p className="text-xs text-muted-foreground">Across all regions</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Male</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">52%</div><Progress value={52} className="h-2 mt-2" /></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Female</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">46%</div><Progress value={46} className="h-2 mt-2" /></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rural / Urban</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">38% / 62%</div><Progress value={62} className="h-2 mt-2" /></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">With Disability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8%</div>
              <Progress value={8} className="h-2 mt-2" />
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground"><span>Visual</span><span>3%</span></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Hearing</span><span>2%</span></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Physical</span><span>2%</span></div>
                <div className="flex justify-between text-xs text-muted-foreground"><span>Learning</span><span>1%</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Growth & Retention */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">User Growth & Retention Metrics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Weekly Active Users</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-3">342</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span>Students</span><span className="font-semibold text-primary">68%</span></div>
                <Progress value={68} className="h-1.5" />
                <div className="flex justify-between text-xs"><span>Teachers</span><span className="font-semibold text-primary">24%</span></div>
                <Progress value={24} className="h-1.5" />
                <div className="flex justify-between text-xs"><span>Admins</span><span className="font-semibold text-primary">8%</span></div>
                <Progress value={8} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-sm">Students</span><span className="text-lg font-bold text-destructive">12%</span></div>
                <div className="flex justify-between items-center"><span className="text-sm">Teachers</span><span className="text-lg font-bold text-destructive">5%</span></div>
                <div className="flex justify-between items-center"><span className="text-sm">Schools</span><span className="text-lg font-bold text-destructive">3%</span></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-medium text-muted-foreground">User Satisfaction</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-sm">Students</span><span className="text-lg font-bold">4.2 / 5</span></div>
                <div className="flex justify-between items-center"><span className="text-sm">Teachers</span><span className="text-lg font-bold">4.5 / 5</span></div>
                <div className="flex justify-between items-center"><span className="text-sm">Admins</span><span className="text-lg font-bold">4.0 / 5</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Growth Trend</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ users: { label: 'Users', color: 'hsl(var(--primary))' } }} className="h-[250px] w-full">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Peak Usage Times */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Peak Usage Times</h3>
          </div>
          <AnalyticsFilters filters={userTypeFilterTypes} values={peakFilters} onChange={handlePeakChange} />
        </div>
        <Card>
          <CardContent className="pt-6">
            <ChartContainer config={{ users: { label: 'Active Users', color: 'hsl(var(--primary))' } }} className="h-[250px] w-full">
              <BarChart data={peakData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Device Usage */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Device Usage</h3>
          </div>
          <AnalyticsFilters filters={userTypeFilterTypes} values={deviceFilters} onChange={handleDeviceChange} />
        </div>
        <Card>
          <CardContent className="pt-6">
            <ChartContainer config={{
              students: { label: 'Students', color: 'hsl(var(--primary))' },
              teachers: { label: 'Teachers', color: 'hsl(var(--accent))' },
              admins: { label: 'Admins', color: 'hsl(var(--muted-foreground))' },
            }} className="h-[280px] w-full">
              <BarChart data={deviceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="device" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="teachers" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="admins" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlatformAnalytics;
