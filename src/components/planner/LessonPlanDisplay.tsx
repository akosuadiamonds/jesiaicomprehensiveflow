import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  RefreshCw, 
  Edit3, 
  Save, 
  X, 
  Check,
  FileText,
  Clock,
  Users,
  BookOpen,
  Download,
  Loader2
} from 'lucide-react';
import { GeneratedLessonPlan } from '@/types/lesson';
import { Separator } from '@/components/ui/separator';
import html2pdf from 'html2pdf.js';

interface LessonPlanDisplayProps {
  plan: GeneratedLessonPlan;
  onRegenerate: () => void;
  onSave: (plan: GeneratedLessonPlan) => void;
  onEdit: (plan: GeneratedLessonPlan) => void;
  isRegenerating: boolean;
}

const LessonPlanDisplay: React.FC<LessonPlanDisplayProps> = ({
  plan,
  onRegenerate,
  onSave,
  onEdit,
  isRegenerating,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState(plan);
  const [activeTab, setActiveTab] = useState<'plan' | 'note'>('plan');
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!contentRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const element = contentRef.current;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${plan.subject}-${plan.class}-lesson-plan.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveEdit = () => {
    onEdit(editedPlan);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedPlan(plan);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={onRegenerate}
          disabled={isRegenerating}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
        
        {isEditing ? (
          <>
            <Button variant="default" onClick={handleSaveEdit}>
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="ghost" onClick={handleCancelEdit}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
        
        <Button variant="hero" onClick={() => onSave(plan)}>
          <Save className="w-4 h-4 mr-2" />
          Save Lesson Plan
        </Button>
        
        <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Download PDF
        </Button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('plan')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'plan'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Lesson Plan
        </button>
        <button
          onClick={() => setActiveTab('note')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'note'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Lesson Note
        </button>
      </div>

      <div ref={contentRef} className="space-y-6">
        {activeTab === 'plan' ? (
          <>
            {/* Header Info */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium text-foreground">{plan.subject}</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{plan.duration} minutes</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{plan.class} • {plan.classSize} students</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Strand:</span>
                  <p className="font-medium">{plan.strand}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sub-Strand:</span>
                  <p className="font-medium">{plan.subStrand}</p>
                </div>
              </CardContent>
            </Card>

            {/* Content Standard & Indicator */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Content Standard</h4>
                  {isEditing ? (
                    <Textarea
                      value={editedPlan.contentStandard}
                      onChange={(e) => setEditedPlan({ ...editedPlan, contentStandard: e.target.value })}
                      rows={2}
                    />
                  ) : (
                    <p>{plan.contentStandard}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Indicator</h4>
                  {isEditing ? (
                    <Textarea
                      value={editedPlan.indicator}
                      onChange={(e) => setEditedPlan({ ...editedPlan, indicator: e.target.value })}
                      rows={2}
                    />
                  ) : (
                    <p>{plan.indicator}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Performance Indicator</h4>
                  {isEditing ? (
                    <Textarea
                      value={editedPlan.performanceIndicator}
                      onChange={(e) => setEditedPlan({ ...editedPlan, performanceIndicator: e.target.value })}
                      rows={2}
                    />
                  ) : (
                    <p>{plan.performanceIndicator}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Teaching Resources & Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Teaching Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedPlan.teachingResources}
                      onChange={(e) => setEditedPlan({ ...editedPlan, teachingResources: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm">{plan.teachingResources}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Keywords</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {plan.keywords.map((keyword, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-semibold text-primary">{keyword.term}:</span>{' '}
                      <span className="text-muted-foreground">{keyword.definition}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Lesson Phases */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lesson Phases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Day</th>
                        <th className="text-left py-3 px-4 font-semibold">Phase 1: Starter</th>
                        <th className="text-left py-3 px-4 font-semibold">Phase 2: New Learning</th>
                        <th className="text-left py-3 px-4 font-semibold">Phase 3: Plenary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.phases.map((phase, index) => (
                        <tr key={index} className="border-b border-border last:border-0">
                          <td className="py-4 px-4 font-medium">{phase.day}</td>
                          <td className="py-4 px-4 text-muted-foreground">{phase.starter}</td>
                          <td className="py-4 px-4 text-muted-foreground">{phase.newLearning}</td>
                          <td className="py-4 px-4 text-muted-foreground">{phase.plenary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Lesson Note Tab */
          <Card>
            <CardHeader>
              <CardTitle>Lesson Note</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editedPlan.lessonNote}
                  onChange={(e) => setEditedPlan({ ...editedPlan, lessonNote: e.target.value })}
                  rows={20}
                  className="font-mono text-sm"
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                    {plan.lessonNote}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LessonPlanDisplay;
