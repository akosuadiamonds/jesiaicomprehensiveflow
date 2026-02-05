import React, { useState } from 'react';
import WizardProgress, { WizardStep } from './WizardProgress';
import ClassInfoStep from './ClassInfoStep';
import LessonDetailsStep from './LessonDetailsStep';
import CurriculumStep from './CurriculumStep';
import CustomizeStep from './CustomizeStep';
import { LessonPlanFormData } from '@/types/lesson';
import { useApp } from '@/contexts/AppContext';

interface LessonPlanWizardProps {
  onGenerate: (data: LessonPlanFormData) => void;
  isGenerating: boolean;
}

const LessonPlanWizard: React.FC<LessonPlanWizardProps> = ({ onGenerate, isGenerating }) => {
  const { currentTerm } = useApp();
  const [currentStep, setCurrentStep] = useState<WizardStep>('class');
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([]);
  
  const [formData, setFormData] = useState<LessonPlanFormData>({
    class: '',
    classSize: 30,
    term: currentTerm,
    learningArea: '',
    lessonWeek: 1,
    lessonDuration: 60,
    lessonDays: [],
    strands: [{ id: '1', strand: '', subStrand: '' }],
    contentStandard: '',
    indicator: '',
    customization: '',
  });

  const handleChange = (field: keyof LessonPlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step);
  };

  const completeStep = (step: WizardStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
  };

  const handleNext = (fromStep: WizardStep, toStep: WizardStep) => {
    completeStep(fromStep);
    goToStep(toStep);
  };

  const handleGenerate = () => {
    completeStep('customize');
    onGenerate({ ...formData, term: currentTerm });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <WizardProgress currentStep={currentStep} completedSteps={completedSteps} />
      
      {currentStep === 'class' && (
        <ClassInfoStep
          formData={formData}
          onChange={handleChange}
          onNext={() => handleNext('class', 'lesson')}
        />
      )}
      
      {currentStep === 'lesson' && (
        <LessonDetailsStep
          formData={formData}
          onChange={handleChange}
          onNext={() => handleNext('lesson', 'curriculum')}
          onBack={() => goToStep('class')}
        />
      )}
      
      {currentStep === 'curriculum' && (
        <CurriculumStep
          formData={formData}
          onChange={handleChange}
          onNext={() => handleNext('curriculum', 'customize')}
          onBack={() => goToStep('lesson')}
        />
      )}
      
      {currentStep === 'customize' && (
        <CustomizeStep
          formData={formData}
          onChange={handleChange}
          onGenerate={handleGenerate}
          onBack={() => goToStep('curriculum')}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
};

export default LessonPlanWizard;
