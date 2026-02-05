import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { LessonPlanFormData } from '@/types/lesson';

interface CustomizeStepProps {
  formData: LessonPlanFormData;
  onChange: (field: keyof LessonPlanFormData, value: any) => void;
  onGenerate: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

const CustomizeStep: React.FC<CustomizeStepProps> = ({ 
  formData, 
  onChange, 
  onGenerate, 
  onBack, 
  isGenerating 
}) => {
  const selectedDays = formData.lessonDays || [];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-4">
          <Wand2 className="w-6 h-6 text-accent-foreground" />
        </div>
        <CardTitle className="text-2xl">Customize & Generate</CardTitle>
        <CardDescription>
          Add any special instructions, then let AI create your lesson plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Summary of selections */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="text-muted-foreground">Class:</span> {formData.class}</div>
            <div><span className="text-muted-foreground">Students:</span> {formData.classSize}</div>
            <div><span className="text-muted-foreground">Subject:</span> {formData.learningArea}</div>
            <div><span className="text-muted-foreground">Duration:</span> {formData.lessonDuration} min/day</div>
            <div className="col-span-2"><span className="text-muted-foreground">Week:</span> {formData.lessonWeek}</div>
          </div>
          
          {/* Days */}
          <div className="pt-2 border-t border-border">
            <span className="text-muted-foreground text-sm">Days:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedDays.map(day => (
                <Badge key={day} variant="secondary" className="text-xs">
                  {day}
                </Badge>
              ))}
            </div>
          </div>

          {formData.strands.length > 0 && formData.strands[0].strand && (
            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground text-sm">Strands:</span>
              {formData.strands.filter(s => s.strand).map((strand, idx) => (
                <div key={idx} className="text-sm mt-1">
                  {strand.strand}
                  {strand.subStrand && (
                    <span className="text-muted-foreground"> → {strand.subStrand}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customization prompt */}
        <div className="space-y-2">
          <Label className="text-base">Additional Instructions (Optional)</Label>
          <Textarea
            placeholder="Examples:
• Focus on visual learners
• Include group activities
• Add real-world examples
• Make it interactive with games
• Include differentiation for struggling students"
            value={formData.customization}
            onChange={(e) => onChange('customization', e.target.value)}
            rows={5}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            The AI will use these instructions to customize your lesson plan
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            onClick={onBack}
            variant="outline"
            className="h-12 text-base px-6"
            disabled={isGenerating}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex-1 h-14 text-lg font-semibold"
            variant="hero"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating {selectedDays.length > 1 ? `${selectedDays.length} Days...` : 'Plan...'}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate {selectedDays.length > 1 ? `${selectedDays.length}-Day Plan` : 'Lesson Plan'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomizeStep;
