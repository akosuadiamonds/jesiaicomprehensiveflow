import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type QuizWizardStep = 'info' | 'curriculum' | 'configure' | 'settings';

const steps: { id: QuizWizardStep; label: string; number: number }[] = [
  { id: 'info', label: 'Basic Info', number: 1 },
  { id: 'curriculum', label: 'Curriculum', number: 2 },
  { id: 'configure', label: 'Configure', number: 3 },
  { id: 'settings', label: 'Settings', number: 4 },
];

interface Props {
  currentStep: QuizWizardStep;
  completedSteps: QuizWizardStep[];
}

const QuizWizardProgress: React.FC<Props> = ({ currentStep, completedSteps }) => {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  isCompleted || isPast ? 'bg-primary text-primary-foreground'
                    : isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {isCompleted || isPast ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <span className={cn('mt-2 text-xs font-medium hidden sm:block', isCurrent ? 'text-primary' : 'text-muted-foreground')}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn('flex-1 h-1 mx-2 rounded-full transition-all', index < currentIndex ? 'bg-primary' : 'bg-muted')} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default QuizWizardProgress;
