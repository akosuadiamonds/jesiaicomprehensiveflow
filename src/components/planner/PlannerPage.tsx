import React, { useState } from 'react';
import LessonPlanForm from './LessonPlanForm';
import LessonPlanDisplay from './LessonPlanDisplay';
import { LessonPlanFormData, GeneratedLessonPlan } from '@/types/lesson';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

// Mock function to generate lesson plan - will be replaced with AI later
const generateMockLessonPlan = (formData: LessonPlanFormData): GeneratedLessonPlan => {
  const mainStrand = formData.strands[0];
  
  return {
    id: Date.now().toString(),
    subject: formData.learningArea,
    duration: formData.lessonDuration,
    class: formData.class,
    classSize: formData.classSize,
    strand: mainStrand?.strand || 'Reading',
    subStrand: mainStrand?.subStrand || 'Word Families',
    contentStandard: formData.contentStandard || 'B3.2.3.1 : Employ knowledge of rhyming endings and common digraphs to enhance reading comprehension',
    indicator: formData.indicator || 'B3.2.3.1.1 : Use common rhyming/endings words for decoding of words',
    performanceIndicator: 'Use common rhyming/endings words for decoding of words',
    coreCompetencies: 'Personal Development and Leadership, Communication and Collaboration',
    teachingResources: 'Flashcards of different words, Charts showing common digraphs, List of rhyming endings, Whiteboard and markers',
    keywords: [
      { term: 'digraphs', definition: 'A combination of two letters representing one sound' },
      { term: 'rhyming endings', definition: 'The phrase or word at the end of a line that has the same sound as another' },
    ],
    references: `${formData.learningArea} Curriculum`,
    phases: [
      {
        day: formData.lessonDay || 'Monday',
        starter: 'Begin with a word game where students identify words that rhyme. Display flashcards with simple words and ask students to find matching rhymes.',
        newLearning: 'Introduce common digraphs (ch, sh, th, wh). Show examples of words containing these digraphs. Have students practice identifying digraphs in a list of words. Group activity: Sort words by their digraph sounds.',
        plenary: 'Review key concepts learned. Students share one new word they learned with a partner. Quick quiz: Identify the digraph in given words.',
      },
    ],
    lessonNote: `LESSON NOTE
Subject: ${formData.learningArea}
Class: ${formData.class}
Term: ${formData.term}
Week: ${formData.lessonWeek}
Duration: ${formData.lessonDuration} minutes

OBJECTIVES:
By the end of this lesson, students will be able to:
1. Identify common rhyming endings in words
2. Recognize and use common digraphs (ch, sh, th, wh)
3. Apply knowledge of rhyming patterns to decode new words

INTRODUCTION (10 minutes):
- Begin with a fun rhyming game
- Display flashcards with simple words
- Ask students to identify words that rhyme

DEVELOPMENT (35 minutes):
- Introduce common digraphs with visual aids
- Demonstrate pronunciation of each digraph
- Provide word lists for practice
- Conduct group sorting activity

CONCLUSION (15 minutes):
- Review key concepts
- Partner sharing activity
- Quick assessment quiz

ASSESSMENT:
- Observation during activities
- Participation in group work
- Quiz performance

HOMEWORK:
- Find 5 words with rhyming endings
- Create a list of 3 words for each digraph learned`,
    createdAt: new Date(),
  };
};

const PlannerPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedLessonPlan | null>(null);
  const [showForm, setShowForm] = useState(true);
  const { addLessonPlan, savedLessonPlans } = useApp();
  const { toast } = useToast();

  const handleGenerate = async (formData: LessonPlanFormData) => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const plan = generateMockLessonPlan(formData);
    setGeneratedPlan(plan);
    setShowForm(false);
    setIsGenerating(false);
    
    toast({
      title: "Lesson Plan Generated!",
      description: "Your AI-powered lesson plan is ready.",
    });
  };

  const handleRegenerate = async () => {
    if (!generatedPlan) return;
    
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate with slight variations
    setGeneratedPlan({
      ...generatedPlan,
      id: Date.now().toString(),
      createdAt: new Date(),
    });
    
    setIsGenerating(false);
    toast({
      title: "Plan Regenerated",
      description: "A new version of your lesson plan is ready.",
    });
  };

  const handleSave = (plan: GeneratedLessonPlan) => {
    addLessonPlan(plan);
    toast({
      title: "Lesson Plan Saved!",
      description: "Your lesson plan has been saved successfully.",
    });
  };

  const handleEdit = (plan: GeneratedLessonPlan) => {
    setGeneratedPlan(plan);
    toast({
      title: "Changes Applied",
      description: "Your edits have been saved.",
    });
  };

  const handleNewPlan = () => {
    setGeneratedPlan(null);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Lesson Planner
          </h1>
          {!showForm && (
            <Button onClick={handleNewPlan} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">
          Generate GES-aligned lesson plans powered by AI
        </p>
      </div>

      {/* Saved Plans Quick Access */}
      {savedLessonPlans.length > 0 && showForm && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Recent Lesson Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedLessonPlans.slice(-3).map((plan) => (
                <Button
                  key={plan.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setGeneratedPlan(plan);
                    setShowForm(false);
                  }}
                >
                  {plan.subject} - {plan.class}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showForm ? (
        <LessonPlanForm onGenerate={handleGenerate} isGenerating={isGenerating} />
      ) : generatedPlan ? (
        <LessonPlanDisplay
          plan={generatedPlan}
          onRegenerate={handleRegenerate}
          onSave={handleSave}
          onEdit={handleEdit}
          isRegenerating={isGenerating}
        />
      ) : null}
    </div>
  );
};

export default PlannerPage;
