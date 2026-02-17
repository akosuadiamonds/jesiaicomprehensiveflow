import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Calendar } from 'lucide-react';
import PlatformAnalytics from './insights/PlatformAnalytics';
import TeacherAnalytics from './insights/TeacherAnalytics';
import LearnerAnalytics from './insights/LearnerAnalytics';

const SAInsights: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('platform');

  const handleExport = () => {
    const rows = [
      ['Platform Insights Report'],
      [`Date Range: ${startDate || 'All time'} to ${endDate || 'Present'}`],
      [`Category: ${activeTab}`],
      [`Generated: ${new Date().toLocaleDateString()}`],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insights-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Insights</h1>
          <p className="text-muted-foreground mt-1">Analytics and metrics across the entire platform</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-[140px] h-9" />
            <span className="text-muted-foreground text-sm">to</span>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-[140px] h-9" />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" /> Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="platform">Platform Analytics</TabsTrigger>
          <TabsTrigger value="teacher">Teacher Analytics</TabsTrigger>
          <TabsTrigger value="learner">Learner Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="platform"><PlatformAnalytics /></TabsContent>
        <TabsContent value="teacher"><TeacherAnalytics /></TabsContent>
        <TabsContent value="learner"><LearnerAnalytics /></TabsContent>
      </Tabs>
    </div>
  );
};

export default SAInsights;
