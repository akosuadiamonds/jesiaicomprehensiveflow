import React, { useState } from 'react';
import QuizInfoStep from './steps/QuizInfoStep';
import QuizCurriculumStep from './steps/QuizCurriculumStep';
import QuizConfigureStep from './steps/QuizConfigureStep';
import QuizSettingsStep from './steps/QuizSettingsStep';
import QuizTestDisplay from './QuizTestDisplay';
import QuizWizardProgress, { QuizWizardStep } from './QuizWizardProgress';
import { QuizTestFormData, QuizTestType, GeneratedQuizTest } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuizTestWizardProps {
  type: QuizTestType;
  onCancel: () => void;
}

const QuizTestWizard: React.FC<QuizTestWizardProps> = ({ type, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<QuizWizardStep>('info');
  const [completedSteps, setCompletedSteps] = useState<QuizWizardStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuizTest | null>(null);

  const [formData, setFormData] = useState<QuizTestFormData>({
    type,
    title: '',
    level: '',
    class: '',
    subject: '',
    strands: [{ id: '1', strand: '', subStrand: '', indicator: '' }],
    questionFormats: ['mcq'],
    dokLevel: 1,
    questionCount: type === 'quiz' ? 10 : 25,
    duration: type === 'quiz' ? 15 : 40,
    isLocked: false,
    accessCode: '',
    assignedClassroomId: '',
    status: 'draft',
  });

  const handleChange = (field: keyof QuizTestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const completeStep = (step: QuizWizardStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  const handleNext = (from: QuizWizardStep, to: QuizWizardStep) => {
    completeStep(from);
    setCurrentStep(to);
  };

  const handleGenerate = async () => {
    completeStep('settings');
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: formData,
      });

      if (error) throw error;

      const quiz: GeneratedQuizTest = {
        id: crypto.randomUUID(),
        type: formData.type,
        title: formData.title,
        subject: formData.subject,
        class: formData.class,
        level: formData.level,
        duration: formData.duration,
        questionFormats: formData.questionFormats,
        dokLevel: formData.dokLevel,
        questions: data.questions,
        totalMarks: data.totalMarks,
        isLocked: formData.isLocked,
        accessCode: formData.isLocked ? (formData.accessCode || generateAccessCode()) : '',
        assignedClassroomId: formData.assignedClassroomId,
        status: 'draft',
        createdAt: new Date(),
      };

      setGeneratedQuiz(quiz);
      toast.success(`${type === 'quiz' ? 'Quiz' : 'Test'} generated successfully!`);
    } catch (error) {
      console.error('Error generating quiz/test:', error);
      toast.error('Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (generatedQuiz) {
    return (
      <QuizTestDisplay
        quiz={generatedQuiz}
        onRegenerate={handleGenerate}
        onBack={() => {
          setGeneratedQuiz(null);
          setCurrentStep('info');
          setCompletedSteps([]);
        }}
        isRegenerating={isGenerating}
        onUpdateQuiz={setGeneratedQuiz}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <QuizWizardProgress currentStep={currentStep} completedSteps={completedSteps} />

      {currentStep === 'info' && (
        <QuizInfoStep formData={formData} onChange={handleChange} onNext={() => handleNext('info', 'curriculum')} onCancel={onCancel} />
      )}
      {currentStep === 'curriculum' && (
        <QuizCurriculumStep formData={formData} onChange={handleChange}
          onNext={() => handleNext('curriculum', 'configure')} onBack={() => setCurrentStep('info')} />
      )}
      {currentStep === 'configure' && (
        <QuizConfigureStep formData={formData} onChange={handleChange}
          onNext={() => handleNext('configure', 'settings')} onBack={() => setCurrentStep('curriculum')} />
      )}
      {currentStep === 'settings' && (
        <QuizSettingsStep formData={formData} onChange={handleChange}
          onGenerate={handleGenerate} onBack={() => setCurrentStep('configure')} isGenerating={isGenerating} />
      )}
    </div>
  );
};

function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default QuizTestWizard;
