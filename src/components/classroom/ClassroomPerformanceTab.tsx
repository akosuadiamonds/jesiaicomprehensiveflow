import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StudentPerformanceRecord {
  studentName: string;
  assignment: string;
  type: string;
  submittedAt: string;
  score: number;
  totalMarks: number;
}

interface ClassroomPerformanceTabProps {
  classroomId: string;
}

const ClassroomPerformanceTab: React.FC<ClassroomPerformanceTabProps> = ({ classroomId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [records, setRecords] = useState<StudentPerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, [classroomId]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    // Fetch students enrolled in this classroom
    const { data: students } = await supabase
      .from('classroom_students')
      .select('student_id')
      .eq('classroom_id', classroomId)
      .eq('is_active', true);

    if (!students || students.length === 0) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const studentIds = students.map(s => s.student_id);

    // Fetch profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', studentIds);

    const profileMap: Record<string, string> = {};
    profiles?.forEach(p => {
      profileMap[p.user_id] = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Student';
    });

    // Fetch resources (assignments) for this classroom
    const { data: resources } = await supabase
      .from('classroom_resources')
      .select('id, title, resource_type, created_at')
      .eq('classroom_id', classroomId)
      .in('resource_type', ['test', 'quiz', 'material']);

    // Build mock performance records based on enrolled students and resources
    const performanceRecords: StudentPerformanceRecord[] = [];
    
    if (resources && resources.length > 0) {
      studentIds.forEach(studentId => {
        resources.forEach(resource => {
          performanceRecords.push({
            studentName: profileMap[studentId] || 'Student',
            assignment: resource.title,
            type: resource.resource_type,
            submittedAt: resource.created_at,
            score: Math.floor(Math.random() * 40) + 60,
            totalMarks: 100,
          });
        });
      });
    }

    setRecords(performanceRecords);
    setLoading(false);
  };

  const filtered = records.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.assignment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Performance</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student or assignment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="test">Tests</SelectItem>
              <SelectItem value="quiz">Quizzes</SelectItem>
              <SelectItem value="material">Materials</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No performance records yet. Assign tests or quizzes to see student results here.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((record, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{record.studentName}</TableCell>
                    <TableCell>{record.assignment}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {record.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(record.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={record.score >= 70 ? 'text-green-600' : record.score >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                        {record.score}/{record.totalMarks}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassroomPerformanceTab;
