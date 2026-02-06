export interface ExamStrandData {
  id: string;
  strand: string;
  subStrand: string;
  indicator: string;
}

export interface ExamFormData {
  level: string;
  class: string;
  subject: string;
  strands: ExamStrandData[];
  schoolName: string;
  examName: string;
  objectiveCount: number;
  sectionBCount: number;
}

export interface MCQQuestion {
  number: number;
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

export interface SectionBQuestion {
  number: number;
  question: string;
  marks: number;
  expectedAnswer: string;
}

export interface GeneratedExam {
  id: string;
  schoolName: string;
  examName: string;
  subject: string;
  class: string;
  level: string;
  duration: string;
  sectionA: MCQQuestion[];
  sectionB: SectionBQuestion[];
  totalMarks: number;
  createdAt: Date;
}
