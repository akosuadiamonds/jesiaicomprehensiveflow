import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Plus, Trash2, Layers } from 'lucide-react';
import { LessonPlanFormData, StrandData } from '@/types/lesson';

interface CurriculumStepProps {
  formData: LessonPlanFormData;
  onChange: (field: keyof LessonPlanFormData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const CurriculumStep: React.FC<CurriculumStepProps> = ({ formData, onChange, onNext, onBack }) => {
  const addStrand = () => {
    const newStrand: StrandData = {
      id: Date.now().toString(),
      strand: '',
      subStrand: '',
    };
    onChange('strands', [...formData.strands, newStrand]);
  };

  const removeStrand = (id: string) => {
    if (formData.strands.length > 1) {
      onChange('strands', formData.strands.filter(s => s.id !== id));
    }
  };

  const updateStrand = (id: string, field: 'strand' | 'subStrand', value: string) => {
    onChange('strands', formData.strands.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const hasAtLeastOneStrand = formData.strands.some(s => s.strand.trim() !== '');

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Layers className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Curriculum Alignment</CardTitle>
        <CardDescription>
          Define the strands, standards, and indicators for your lesson
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Strands Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Strands & Sub-Strands</Label>
            <Button type="button" variant="outline" size="sm" onClick={addStrand}>
              <Plus className="w-4 h-4 mr-1" />
              Add More
            </Button>
          </div>
          
          {formData.strands.map((strand, index) => (
            <div key={strand.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Strand {index + 1}
                </span>
                {formData.strands.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStrand(strand.id)}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="e.g., Reading"
                  value={strand.strand}
                  onChange={(e) => updateStrand(strand.id, 'strand', e.target.value)}
                  className="h-11"
                />
                <Input
                  placeholder="e.g., Word Families"
                  value={strand.subStrand}
                  onChange={(e) => updateStrand(strand.id, 'subStrand', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Content Standard */}
        <div className="space-y-2">
          <Label className="text-base">Content Standard (Optional)</Label>
          <Textarea
            placeholder="e.g., B3.2.3.1 : Employ knowledge of rhyming endings..."
            value={formData.contentStandard}
            onChange={(e) => onChange('contentStandard', e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        {/* Indicator */}
        <div className="space-y-2">
          <Label className="text-base">Indicator (Optional)</Label>
          <Textarea
            placeholder="e.g., B3.2.3.1.1 : Use common rhyming/endings words..."
            value={formData.indicator}
            onChange={(e) => onChange('indicator', e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            onClick={onBack}
            variant="outline"
            className="flex-1 h-12 text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            onClick={onNext} 
            disabled={!hasAtLeastOneStrand}
            className="flex-1 h-12 text-base"
            variant="hero"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurriculumStep;
