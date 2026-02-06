import React, { useState } from 'react';
import ExamProgress, { ExamWizardStep } from './ExamProgress';
import ExamInfoStep from './ExamInfoStep';
import ExamCurriculumStep from './ExamCurriculumStep';
import ExamSettingsStep from './ExamSettingsStep';
import ExamDisplay from './ExamDisplay';
import { ExamFormData, GeneratedExam } from '@/types/exam';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExamWizardProps {
  onCancel: () => void;
}

const ExamWizard: React.FC<ExamWizardProps> = ({ onCancel }) => {
  const [currentStep, setCurrentStep] = useState<ExamWizardStep>('info');
  const [completedSteps, setCompletedSteps] = useState<ExamWizardStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<GeneratedExam | null>(null);

  const [formData, setFormData] = useState<ExamFormData>({
    level: '',
    class: '',
    subject: '',
    strands: [{ id: '1', strand: '', subStrand: '', indicator: '' }],
    schoolName: '',
    examName: 'End of Term Examination',
    objectiveCount: 30,
    sectionBCount: 5,
  });

  const handleChange = (field: keyof ExamFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const completeStep = (step: ExamWizardStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  const handleNext = (from: ExamWizardStep, to: ExamWizardStep) => {
    completeStep(from);
    setCurrentStep(to);
  };

  const handleGenerate = async () => {
    completeStep('settings');
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-exam', {
        body: formData,
      });

      if (error) throw error;

      const exam: GeneratedExam = {
        id: crypto.randomUUID(),
        schoolName: formData.schoolName,
        examName: formData.examName,
        subject: formData.subject,
        class: formData.class,
        level: formData.level,
        duration: '2 hours',
        sectionA: data.sectionA,
        sectionB: data.sectionB,
        totalMarks: data.totalMarks,
        createdAt: new Date(),
      };

      setGeneratedExam(exam);
      toast.success('Exam generated successfully!');
    } catch (error) {
      console.error('Error generating exam:', error);
      toast.error('Failed to generate exam. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (generatedExam) {
    return (
      <ExamDisplay
        exam={generatedExam}
        onRegenerate={handleGenerate}
        onBack={() => {
          setGeneratedExam(null);
          setCurrentStep('info');
          setCompletedSteps([]);
        }}
        isRegenerating={isGenerating}
        onUpdateExam={setGeneratedExam}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ExamProgress currentStep={currentStep} completedSteps={completedSteps} />

      {currentStep === 'info' && (
        <ExamInfoStep formData={formData} onChange={handleChange}
          onNext={() => handleNext('info', 'curriculum')} onCancel={onCancel} />
      )}
      {currentStep === 'curriculum' && (
        <ExamCurriculumStep formData={formData} onChange={handleChange}
          onNext={() => handleNext('curriculum', 'settings')} onBack={() => setCurrentStep('info')} />
      )}
      {currentStep === 'settings' && (
        <ExamSettingsStep formData={formData} onChange={handleChange}
          onGenerate={handleGenerate} onBack={() => setCurrentStep('curriculum')} isGenerating={isGenerating} />
      )}
    </div>
  );
};

export default ExamWizard;
