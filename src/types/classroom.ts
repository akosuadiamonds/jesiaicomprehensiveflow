export type ClassroomType = 'school' | 'private';

export interface Classroom {
  id: string;
  teacher_id: string;
  name: string;
  description: string | null;
  subject: string;
  classroom_type: ClassroomType;
  invite_code: string;
  monthly_fee: number;
  currency: string;
  max_students: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassroomStudent {
  id: string;
  classroom_id: string;
  student_id: string;
  joined_at: string;
  is_active: boolean;
  subscription_status: string;
  subscription_expires_at: string | null;
}

export interface ClassroomResource {
  id: string;
  classroom_id: string;
  teacher_id: string;
  title: string;
  resource_type: 'lesson_plan' | 'test' | 'quiz' | 'announcement' | 'material';
  content: Record<string, any> | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassroomAnnouncement {
  id: string;
  classroom_id: string;
  teacher_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export interface CreateClassroomData {
  name: string;
  description?: string;
  subject: string;
  classroom_type: ClassroomType;
  monthly_fee?: number;
  max_students?: number;
}
