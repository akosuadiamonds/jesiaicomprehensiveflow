export interface StrandData {
  id: string;
  strand: string;
  subStrand: string;
}

export interface LessonPlanFormData {
  class: string;
  classSize: number;
  term: string;
  learningArea: string;
  lessonWeek: number;
  lessonDuration: number;
  lessonDay: string;
  strands: StrandData[];
  contentStandard: string;
  indicator: string;
  customization: string;
}

export interface GeneratedLessonPlan {
  id: string;
  subject: string;
  duration: number;
  class: string;
  classSize: number;
  strand: string;
  subStrand: string;
  contentStandard: string;
  indicator: string;
  performanceIndicator: string;
  coreCompetencies: string;
  teachingResources: string;
  keywords: { term: string; definition: string }[];
  references: string;
  phases: {
    day: string;
    starter: string;
    newLearning: string;
    plenary: string;
  }[];
  lessonNote: string;
  createdAt: Date;
}
