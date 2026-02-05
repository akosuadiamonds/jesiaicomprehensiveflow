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

// Mock function to generate lesson plan for multiple days
const generateMockLessonPlan = (formData: LessonPlanFormData): GeneratedLessonPlan => {
  const mainStrand = formData.strands[0];
  const days = formData.lessonDays || [formData.lessonDay || 'Monday'];
  
  // Generate phases for each selected day
  const phases = days.map((day, index) => ({
    day,
    starter: index === 0 
      ? 'Begin with a word game where students identify words that rhyme. Display flashcards with simple words and ask students to find matching rhymes.'
      : `Review previous day's content. Quick warm-up activity to refresh memory on ${mainStrand?.strand || 'the topic'}.`,
    newLearning: index === 0
      ? 'Introduce common digraphs (ch, sh, th, wh). Show examples of words containing these digraphs. Have students practice identifying digraphs in a list of words. Group activity: Sort words by their digraph sounds.'
      : `Continue with advanced concepts in ${mainStrand?.subStrand || 'the sub-topic'}. Practice exercises with partners. Interactive discussion and examples.`,
    plenary: 'Review key concepts learned. Students share one new word they learned with a partner. Quick quiz: Identify the digraph in given words.',
  }));

  // Generate lesson notes for students
  const lessonNote = `LESSON NOTE FOR STUDENTS
Subject: ${formData.learningArea}
Class: ${formData.class}
Week: ${formData.lessonWeek}

📚 WHAT YOU WILL LEARN:
By the end of ${days.length > 1 ? 'these lessons' : 'this lesson'}, you will be able to:
1. Identify common rhyming endings in words
2. Recognize and use common digraphs (ch, sh, th, wh)
3. Apply knowledge of rhyming patterns to decode new words

📖 KEY VOCABULARY:
• Digraph - A combination of two letters representing one sound (e.g., "ch" in chair)
• Rhyming endings - Words that end with the same sound (e.g., cat, bat, hat)
• Phonics - The relationship between letters and sounds

${days.map((day, i) => `
📅 ${day.toUpperCase()} (Day ${i + 1}):
${i === 0 ? `
We will start by playing a fun rhyming game! You will learn to spot words that sound alike at the end. Then, we'll discover special letter pairs called digraphs and how they make unique sounds.

✏️ Activities:
- Find rhyming pairs in flashcard games
- Sort words by their beginning sounds
- Work in groups to make word lists
` : `
Building on what we learned, we'll practice more with ${mainStrand?.subStrand || 'our topic'}. You'll work with partners and do fun exercises.

✏️ Activities:
- Partner practice exercises
- Creative word building
- Group discussions
`}`).join('')}

📝 HOMEWORK:
- Find 5 words with rhyming endings at home
- Create a list of 3 words for each digraph you learned
- Practice reading words with your family

💡 REMEMBER:
Learning to read is like solving a puzzle - each piece helps you see the bigger picture!`;

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
    phases,
    lessonNote,
    createdAt: new Date(),
  };
};

type PlannerView = 'create' | 'history' | 'display';

const PlannerPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedLessonPlan | null>(null);
  const [currentView, setCurrentView] = useState<PlannerView>('create');
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const { addLessonPlan, savedLessonPlans, deleteLessonPlan, updateLessonPlan } = useApp();
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
      description: `Your ${formData.lessonDays?.length || 1}-day lesson plan is ready.`,
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
    // Check if this plan already exists (is being edited from history)
    const existingPlan = savedLessonPlans.find(p => p.id === plan.id);
    if (existingPlan) {
      updateLessonPlan(plan.id, plan);
      toast({
        title: "Lesson Plan Updated!",
        description: "Your changes have been saved.",
      });
    } else {
      addLessonPlan(plan);
      toast({
        title: "Lesson Plan Saved!",
        description: "Your lesson plan has been saved to History.",
      });
    }
    // Navigate to history after save
    setCurrentView('create');
    setActiveTab('history');
  };

  const handleEdit = (plan: GeneratedLessonPlan) => {
    // Update the current displayed plan
    setGeneratedPlan(plan);
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
