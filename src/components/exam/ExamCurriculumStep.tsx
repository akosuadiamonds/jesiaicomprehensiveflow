import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Layers } from 'lucide-react';
import { ExamFormData, ExamStrandData } from '@/types/exam';
import { getStrandsForSubject } from '@/data/curriculumData';

interface ExamCurriculumStepProps {
  formData: ExamFormData;
  onChange: (field: keyof ExamFormData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const ExamCurriculumStep: React.FC<ExamCurriculumStepProps> = ({ formData, onChange, onNext, onBack }) => {
  const strandOptions = getStrandsForSubject(formData.subject);

  // Derive selected strands and substrands from formData.strands
  const selectedStrands = useMemo(() => formData.strands.map(s => s.strand).filter(Boolean), [formData.strands]);
  const selectedSubStrands = useMemo(() => formData.strands.map(s => s.subStrand).filter(Boolean), [formData.strands]);

  // Get all substrands for selected strands
  const availableSubStrands = useMemo(() => {
    const result: { strand: string; subStrand: string }[] = [];
    strandOptions.forEach(opt => {
      if (selectedStrands.includes(opt.strand)) {
        opt.subStrands.forEach(sub => {
          result.push({ strand: opt.strand, subStrand: sub });
        });
      }
    });
    return result;
  }, [strandOptions, selectedStrands]);

  const toggleStrand = (strandName: string) => {
    const isSelected = selectedStrands.includes(strandName);
    let newStrands: ExamStrandData[];

    if (isSelected) {
      // Remove this strand and its substrands
      newStrands = formData.strands.filter(s => s.strand !== strandName);
      if (newStrands.length === 0) {
        newStrands = [{ id: '1', strand: '', subStrand: '', indicator: '' }];
      }
    } else {
      // Add the strand entry
      const cleaned = formData.strands.filter(s => s.strand); // remove empty placeholders
      newStrands = [...cleaned, { id: Date.now().toString(), strand: strandName, subStrand: '', indicator: '' }];
    }
    onChange('strands', newStrands);
  };

  const toggleSubStrand = (strandName: string, subStrandName: string) => {
    const exists = formData.strands.some(s => s.strand === strandName && s.subStrand === subStrandName);
    let newStrands: ExamStrandData[];

    if (exists) {
      // Remove this specific substrand entry
      newStrands = formData.strands.filter(s => !(s.strand === strandName && s.subStrand === subStrandName));
      // Keep at least the strand-level entry if no substrands remain for that strand
      const hasStrandEntry = newStrands.some(s => s.strand === strandName);
      if (!hasStrandEntry && selectedStrands.includes(strandName)) {
        newStrands.push({ id: Date.now().toString(), strand: strandName, subStrand: '', indicator: '' });
      }
      if (newStrands.length === 0) {
        newStrands = [{ id: '1', strand: '', subStrand: '', indicator: '' }];
      }
    } else {
      // Add substrand entry, remove the empty strand-level placeholder if it exists
      const cleaned = formData.strands.filter(s => !(s.strand === strandName && s.subStrand === ''));
      newStrands = [...cleaned, { id: Date.now().toString(), strand: strandName, subStrand: subStrandName, indicator: '' }];
    }
    onChange('strands', newStrands);
  };

  const indicator = formData.strands.find(s => s.indicator)?.indicator || '';
  const setIndicator = (value: string) => {
    const newStrands = formData.strands.map((s, i) => i === 0 ? { ...s, indicator: value } : s);
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
        <CardDescription>Select the strands and sub-strands the exam should cover</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Strands as checkboxes */}
        {strandOptions.length > 0 ? (
          <>
            <div className="space-y-3">
              <Label className="text-base font-semibold">Strands</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {strandOptions.map(opt => (
                  <label key={opt.strand}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                    <Checkbox
                      checked={selectedStrands.includes(opt.strand)}
                      onCheckedChange={() => toggleStrand(opt.strand)}
                    />
                    <span className="text-sm font-medium">{opt.strand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sub-strands for selected strands */}
            {availableSubStrands.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Sub-Strands</Label>
                <p className="text-xs text-muted-foreground">Select the specific sub-strands to include in the exam</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableSubStrands.map(({ strand, subStrand }) => (
                    <label key={`${strand}-${subStrand}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                      <Checkbox
                        checked={selectedSubStrands.includes(subStrand) && formData.strands.some(s => s.strand === strand && s.subStrand === subStrand)}
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
        ) : (
          <div className="space-y-2">
            <Label className="text-base font-semibold">Strands (manual entry)</Label>
            <Input placeholder="e.g., Reading, Writing" className="h-11" />
          </div>
        )}

        {/* Indicator */}
        <div className="space-y-2">
          <Label className="text-base">Indicator (Optional)</Label>
          <Input
            placeholder="e.g., B3.2.3.1.1 : Use common rhyming words..."
            value={indicator}
            onChange={(e) => setIndicator(e.target.value)}
            className="h-11"
          />
        </div>

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

export default ExamCurriculumStep;
