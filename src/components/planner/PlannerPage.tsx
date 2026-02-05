import React, { useState } from 'react';
import LessonPlanWizard from './wizard/LessonPlanWizard';
import LessonPlanDisplay from './LessonPlanDisplay';
import PlanHistoryList from './history/PlanHistoryList';
import { LessonPlanFormData, GeneratedLessonPlan } from '@/types/lesson';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, History, Sparkles } from 'lucide-react';

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

type PlannerView = 'create' | 'history' | 'display';

const PlannerPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedLessonPlan | null>(null);
  const [currentView, setCurrentView] = useState<PlannerView>('create');
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const { addLessonPlan, savedLessonPlans, deleteLessonPlan } = useApp();
  const { toast } = useToast();

  const handleGenerate = async (formData: LessonPlanFormData) => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const plan = generateMockLessonPlan(formData);
    setGeneratedPlan(plan);
    setCurrentView('display');
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
      description: "Your lesson plan has been saved to History.",
    });
    // Navigate to history after save
    setCurrentView('create');
    setActiveTab('history');
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
    setCurrentView('create');
    setActiveTab('create');
  };

  const handleViewPlan = (plan: GeneratedLessonPlan) => {
    setGeneratedPlan(plan);
    setCurrentView('display');
  };

  const handleDeletePlan = (id: string) => {
    deleteLessonPlan(id);
    toast({
      title: "Plan Deleted",
      description: "The lesson plan has been removed.",
    });
  };

  // Show the display view when a plan is generated or being viewed
  if (currentView === 'display' && generatedPlan) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Lesson Plan
            </h1>
            <Button onClick={handleNewPlan} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </div>
        </div>
        <LessonPlanDisplay
          plan={generatedPlan}
          onRegenerate={handleRegenerate}
          onSave={handleSave}
          onEdit={handleEdit}
          isRegenerating={isGenerating}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Lesson Planner
        </h1>
        <p className="text-muted-foreground">
          Generate GES-aligned lesson plans powered by AI
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'history')}>
        <TabsList className="mb-6">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            New Plan
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
            {savedLessonPlans.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                {savedLessonPlans.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-0">
          <LessonPlanWizard onGenerate={handleGenerate} isGenerating={isGenerating} />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <PlanHistoryList
            plans={savedLessonPlans}
            onView={handleViewPlan}
            onDelete={handleDeletePlan}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlannerPage;
