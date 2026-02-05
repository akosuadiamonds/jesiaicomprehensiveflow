import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ClassroomPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Classroom
        </h1>
        <p className="text-muted-foreground">
          Manage your classes and track student progress
        </p>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Create private classes, add students, and track their learning progress. 
            Share lesson plans and quizzes directly with your class.
          </p>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Create Class
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassroomPage;
