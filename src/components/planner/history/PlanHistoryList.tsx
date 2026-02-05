import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GeneratedLessonPlan } from '@/types/lesson';
import { FileText, Clock, Users, Eye, Trash2, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

interface PlanHistoryListProps {
  plans: GeneratedLessonPlan[];
  onView: (plan: GeneratedLessonPlan) => void;
  onDelete: (id: string) => void;
}

const PlanHistoryList: React.FC<PlanHistoryListProps> = ({ plans, onView, onDelete }) => {
  if (plans.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Saved Plans Yet</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            Generate and save your first lesson plan to see it appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <Card key={plan.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {plan.subject}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{plan.class}</Badge>
                  <span>•</span>
                  <span>{plan.strand}</span>
                  {plan.subStrand && (
                    <>
                      <span>→</span>
                      <span>{plan.subStrand}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onView(plan)}>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onDelete(plan.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {plan.duration} min
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {plan.classSize} students
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {format(new Date(plan.createdAt), 'MMM d, yyyy')}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PlanHistoryList;
