import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Layers } from 'lucide-react';
import { QuizTestFormData } from '@/types/quiz';
import { getStrandsForSubject } from '@/data/curriculumData';

interface Props {
  formData: QuizTestFormData;
  onChange: (field: keyof QuizTestFormData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const QuizCurriculumStep: React.FC<Props> = ({ formData, onChange, onNext, onBack }) => {
  const strandOptions = getStrandsForSubject(formData.subject);
  const selectedStrands = useMemo(() => formData.strands.map(s => s.strand).filter(Boolean), [formData.strands]);

  const availableSubStrands = useMemo(() => {
    const result: { strand: string; subStrand: string }[] = [];
    strandOptions.forEach(opt => {
      if (selectedStrands.includes(opt.strand)) {
        opt.subStrands.forEach(sub => result.push({ strand: opt.strand, subStrand: sub }));
      }
    });
    return result;
  }, [strandOptions, selectedStrands]);

  const toggleStrand = (strandName: string) => {
    const isSelected = selectedStrands.includes(strandName);
    let newStrands = isSelected
      ? formData.strands.filter(s => s.strand !== strandName)
      : [...formData.strands.filter(s => s.strand), { id: Date.now().toString(), strand: strandName, subStrand: '', indicator: '' }];
    if (newStrands.length === 0) newStrands = [{ id: '1', strand: '', subStrand: '', indicator: '' }];
    onChange('strands', newStrands);
  };

  const toggleSubStrand = (strandName: string, subStrandName: string) => {
    const exists = formData.strands.some(s => s.strand === strandName && s.subStrand === subStrandName);
    let newStrands = exists
      ? formData.strands.filter(s => !(s.strand === strandName && s.subStrand === subStrandName))
      : [...formData.strands.filter(s => !(s.strand === strandName && s.subStrand === '')), { id: Date.now().toString(), strand: strandName, subStrand: subStrandName, indicator: '' }];
    if (!newStrands.some(s => s.strand === strandName)) {
      newStrands.push({ id: Date.now().toString(), strand: strandName, subStrand: '', indicator: '' });
    }
    if (newStrands.length === 0) newStrands = [{ id: '1', strand: '', subStrand: '', indicator: '' }];
    onChange('strands', newStrands);
  };

  const hasAtLeastOneStrand = formData.strands.some(s => s.strand.trim() !== '');

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Layers className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Curriculum Coverage</CardTitle>
        <CardDescription>Select the strands and sub-strands to cover</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {strandOptions.length > 0 && (
          <>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Strands</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {strandOptions.map(opt => (
                  <label key={opt.strand} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                    <Checkbox checked={selectedStrands.includes(opt.strand)} onCheckedChange={() => toggleStrand(opt.strand)} />
                    <span className="text-sm font-medium">{opt.strand}</span>
                  </label>
                ))}
              </div>
            </div>

            {availableSubStrands.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Sub-Strands</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableSubStrands.map(({ strand, subStrand }) => (
                    <label key={`${strand}-${subStrand}`} className="flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                      <Checkbox
                        checked={formData.strands.some(s => s.strand === strand && s.subStrand === subStrand)}
                        onCheckedChange={() => toggleSubStrand(strand, subStrand)}
                      />
                      <div>
                        <span className="text-sm">{subStrand}</span>
                        <span className="text-xs text-muted-foreground ml-1">({strand})</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3 mt-6">
          <Button onClick={onBack} variant="outline" className="flex-1 h-12 text-base">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={onNext} disabled={!hasAtLeastOneStrand} className="flex-1 h-12 text-base" variant="hero">
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizCurriculumStep;
