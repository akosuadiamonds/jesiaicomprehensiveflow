import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { LessonPlanFormData, StrandData } from '@/types/lesson';

const classes = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const learningAreas = ['English Language', 'Mathematics', 'Science', 'Social Studies', 'Creative Arts', 'Physical Education', 'ICT', 'French', 'Ghanaian Language', 'Religious & Moral Education'];

interface LessonPlanFormProps {
  onGenerate: (data: LessonPlanFormData) => void;
  isGenerating: boolean;
}

const LessonPlanForm: React.FC<LessonPlanFormProps> = ({ onGenerate, isGenerating }) => {
  const { currentTerm, setCurrentTerm } = useApp();
  
  const [formData, setFormData] = useState<LessonPlanFormData>({
    class: '',
    classSize: 30,
    term: currentTerm,
    learningArea: '',
    lessonWeek: 1,
    lessonDuration: 60,
    lessonDay: '',
    strands: [{ id: '1', strand: '', subStrand: '' }],
    contentStandard: '',
    indicator: '',
    customization: '',
  });

  const handleChange = (field: keyof LessonPlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addStrand = () => {
    const newStrand: StrandData = {
      id: Date.now().toString(),
      strand: '',
      subStrand: '',
    };
    setFormData(prev => ({
      ...prev,
      strands: [...prev.strands, newStrand],
    }));
  };

  const removeStrand = (id: string) => {
    if (formData.strands.length > 1) {
      setFormData(prev => ({
        ...prev,
        strands: prev.strands.filter(s => s.id !== id),
      }));
    }
  };

  const updateStrand = (id: string, field: 'strand' | 'subStrand', value: string) => {
    setFormData(prev => ({
      ...prev,
      strands: prev.strands.map(s =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Class Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select value={formData.class} onValueChange={(v) => handleChange('class', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="classSize">Class Size</Label>
            <Input
              id="classSize"
              type="number"
              value={formData.classSize}
              onChange={(e) => handleChange('classSize', parseInt(e.target.value) || 0)}
              min={1}
              max={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="term">Current Term</Label>
            <div className="flex items-center gap-2">
              <Select value={currentTerm} onValueChange={setCurrentTerm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                (System set)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lesson Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="learningArea">Learning Area</Label>
            <Select value={formData.learningArea} onValueChange={(v) => handleChange('learningArea', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {learningAreas.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessonWeek">Lesson Week</Label>
            <Input
              id="lessonWeek"
              type="number"
              value={formData.lessonWeek}
              onChange={(e) => handleChange('lessonWeek', parseInt(e.target.value) || 1)}
              min={1}
              max={15}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessonDuration">Duration (minutes)</Label>
            <Input
              id="lessonDuration"
              type="number"
              value={formData.lessonDuration}
              onChange={(e) => handleChange('lessonDuration', parseInt(e.target.value) || 30)}
              min={15}
              max={180}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessonDay">Lesson Day</Label>
            <Select value={formData.lessonDay} onValueChange={(v) => handleChange('lessonDay', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {days.map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Strand & Sub-Strand</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addStrand}>
            <Plus className="w-4 h-4 mr-1" />
            Add Strand
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.strands.map((strand, index) => (
            <div key={strand.id} className="p-4 border border-border rounded-lg space-y-4">
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
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Strand</Label>
                  <Input
                    placeholder="e.g., Reading"
                    value={strand.strand}
                    onChange={(e) => updateStrand(strand.id, 'strand', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sub-Strand</Label>
                  <Input
                    placeholder="e.g., Word Families"
                    value={strand.subStrand}
                    onChange={(e) => updateStrand(strand.id, 'subStrand', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contentStandard">Content Standard</Label>
            <Textarea
              id="contentStandard"
              placeholder="e.g., B3.2.3.1 : Employ knowledge of rhyming endings..."
              value={formData.contentStandard}
              onChange={(e) => handleChange('contentStandard', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="indicator">Indicator</Label>
            <Textarea
              id="indicator"
              placeholder="e.g., B3.2.3.1.1 : Use common rhyming/endings words..."
              value={formData.indicator}
              onChange={(e) => handleChange('indicator', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="customization">Additional Instructions (Optional)</Label>
            <Textarea
              id="customization"
              placeholder="Add any specific requirements, teaching style preferences, or focus areas for the AI to consider..."
              value={formData.customization}
              onChange={(e) => handleChange('customization', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" variant="hero" disabled={isGenerating}>
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating Lesson Plan...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Lesson Plan
          </>
        )}
      </Button>
    </form>
  );
};

export default LessonPlanForm;
