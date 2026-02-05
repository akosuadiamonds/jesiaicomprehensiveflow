import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const InsightsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Insights & Analytics
        </h1>
        <p className="text-muted-foreground">
          Track your teaching progress and student performance
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            View detailed analytics on lesson plan usage, quiz performance, 
            and student engagement. Get AI-powered suggestions to improve your teaching.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsPage;
