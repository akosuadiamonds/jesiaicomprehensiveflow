import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StudentClassroom {
  id: string;
  classroom_id: string;
  approval_status: string;
  is_active: boolean;
  joined_at: string;
  classroom: {
    id: string;
    name: string;
    description: string | null;
    subject: string;
    classroom_type: string;
    monthly_fee: number | null;
    invite_code: string;
    teacher_id: string;
  };
  teacher_name: string;
}

export const useStudentClassrooms = () => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<StudentClassroom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClassrooms = async () => {
    if (!user) return;
    setLoading(true);

    const { data: enrollments, error } = await supabase
      .from('classroom_students')
      .select('id, classroom_id, approval_status, is_active, joined_at')
      .eq('student_id', user.id);

    if (error || !enrollments) {
      setClassrooms([]);
      setLoading(false);
      return;
    }

    const classroomIds = enrollments.map(e => e.classroom_id);
    if (classroomIds.length === 0) {
      setClassrooms([]);
      setLoading(false);
      return;
    }

    const { data: classroomsData } = await supabase
      .from('classrooms')
      .select('id, name, description, subject, classroom_type, monthly_fee, invite_code, teacher_id')
      .in('id', classroomIds);

    if (!classroomsData) {
      setClassrooms([]);
      setLoading(false);
      return;
    }

    // Fetch teacher names
    const teacherIds = [...new Set(classroomsData.map(c => c.teacher_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', teacherIds);

    const teacherMap: Record<string, string> = {};
    profiles?.forEach(p => {
      teacherMap[p.user_id] = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Teacher';
    });

    const classroomMap = Object.fromEntries(classroomsData.map(c => [c.id, c]));

    const result: StudentClassroom[] = enrollments
      .filter(e => classroomMap[e.classroom_id])
      .map(e => ({
        ...e,
        classroom: classroomMap[e.classroom_id],
        teacher_name: teacherMap[classroomMap[e.classroom_id].teacher_id] || 'Teacher',
      }));

    setClassrooms(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchClassrooms();
  }, [user]);

  const approvedClassrooms = classrooms.filter(c => c.approval_status === 'approved' && c.is_active);
  const pendingClassrooms = classrooms.filter(c => c.approval_status === 'pending');

  return { classrooms, approvedClassrooms, pendingClassrooms, loading, refetch: fetchClassrooms };
};
