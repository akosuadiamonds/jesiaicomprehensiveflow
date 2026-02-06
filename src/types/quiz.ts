export type QuizTestType = 'quiz' | 'test';

export type QuestionFormat = 'mcq' | 'true_false' | 'short_answer' | 'fill_blank';
export type DOKLevel = 1 | 2 | 3 | 4;

export interface QuizTestFormData {
  type: QuizTestType;
  title: string;
  level: string;
  class: string;
  subject: string;
  strands: { id: string; strand: string; subStrand: string; indicator: string }[];
  questionFormats: QuestionFormat[];
  dokLevel: DOKLevel;
  questionCount: number;
  duration: number; // in minutes
  isLocked: boolean;
  accessCode: string;
  assignedClassroomId: string;
  status: 'draft' | 'approved' | 'assigned';
}

export interface QuizMCQQuestion {
  number: number;
  question: string;
  format: QuestionFormat;
  options?: { label: string; text: string }[];
  correctAnswer: string;
  dokLevel: DOKLevel;
}

export interface GeneratedQuizTest {
  id: string;
  type: QuizTestType;
  title: string;
  subject: string;
  class: string;
  level: string;
  duration: number;
  questionFormats: QuestionFormat[];
  dokLevel: DOKLevel;
  questions: QuizMCQQuestion[];
  totalMarks: number;
  isLocked: boolean;
  accessCode: string;
  assignedClassroomId: string;
  status: 'draft' | 'approved' | 'assigned';
  createdAt: Date;
}
