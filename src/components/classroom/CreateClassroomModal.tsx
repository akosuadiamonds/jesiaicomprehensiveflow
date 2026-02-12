import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { School, Briefcase, Loader2, Lock, Users, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClassroomType, CreateClassroomData, FeeFrequency } from '@/types/classroom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CreateClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateClassroomData) => Promise<{ error: any }>;
  defaultType?: ClassroomType;
  isPremium?: boolean;
}

const SUBJECTS = [
  'Mathematics', 'English Language', 'Science', 'Social Studies', 'ICT',
  'Creative Arts', 'Religious & Moral Education', 'French', 'Ghanaian Language',
  'Physical Education', 'Other',
];

const CLASS_GRADES = [
  'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6',
  'JHS 1', 'JHS 2', 'JHS 3',
];

const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({
  open, onOpenChange, onSubmit, defaultType = 'school', isPremium = false,
}) => {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [matchingStudentCount, setMatchingStudentCount] = useState<number>(0);
  const [formData, setFormData] = useState<CreateClassroomData>({
    name: '',
    description: '',
    subject: profile?.subjects?.[0] || '',
    classroom_type: defaultType,
    monthly_fee: 0,
    fee_frequency: 'monthly',
    max_students: 50,
    class_grade: '',
  });

  const isPrivate = formData.classroom_type === 'private';
  const isSchoolLinked = !!institutionId && !isPrivate;

  // Check if teacher belongs to an institution
  useEffect(() => {
    const checkInstitution = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('institution_members')
        .select('institution_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .single();
      setInstitutionId(data?.institution_id || null);
    };
    if (open) checkInstitution();
  }, [user, open]);

  // Count matching students when class_grade changes
  useEffect(() => {
    const countStudents = async () => {
      if (!institutionId || !formData.class_grade || isPrivate) {
        setMatchingStudentCount(0);
        return;
      }
      const { count } = await supabase
        .from('institution_members')
        .select('id, user_id', { count: 'exact', head: false })
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .eq('member_role', 'student');

      if (!count) {
        setMatchingStudentCount(0);
        return;
      }

      // Now filter by class_grade from profiles
      const { data: members } = await supabase
        .from('institution_members')
        .select('user_id')
        .eq('institution_id', institutionId)
        .eq('is_active', true)
        .eq('member_role', 'student');

      if (!members || members.length === 0) {
        setMatchingStudentCount(0);
        return;
      }

      const studentIds = members.map(m => m.user_id);
      const { count: matchCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .in('user_id', studentIds)
        .eq('class_grade', formData.class_grade);

      setMatchingStudentCount(matchCount || 0);
    };
    countStudents();
  }, [institutionId, formData.class_grade, isPrivate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPrivate && !formData.description?.trim()) return;
    setLoading(true);
    const result = await onSubmit(formData);
    setLoading(false);
    if (!result.error) {
      setFormData({
        name: '', description: '', subject: profile?.subjects?.[0] || '',
        classroom_type: defaultType, monthly_fee: 0, fee_frequency: 'monthly', max_students: 50, class_grade: '',
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Classroom</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Classroom Type Selection */}
          <div className="space-y-3">
            <Label>Classroom Type</Label>
            <RadioGroup
              value={formData.classroom_type}
              onValueChange={(value: ClassroomType) =>
                setFormData({ ...formData, classroom_type: value })
              }
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="school" id="school" className="peer sr-only" />
                <Label
                  htmlFor="school"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <School className="mb-2 h-6 w-6" />
                  <span className="font-medium">School Class</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">For your school students</span>
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem value="private" id="private" className="peer sr-only" disabled={!isPremium} />
                <Label
                  htmlFor="private"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-lg border-2 p-4 transition-all",
                    isPremium
                      ? "border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      : "border-dashed border-muted-foreground/30 bg-muted/30 cursor-not-allowed"
                  )}
                >
                  {!isPremium && (
                    <span className="absolute -top-2.5 right-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      <Lock className="h-3 w-3" /> Premium
                    </span>
                  )}
                  <Briefcase className={cn("mb-2 h-6 w-6", !isPremium && "text-muted-foreground/50")} />
                  <span className={cn("font-medium", !isPremium && "text-muted-foreground/70")}>Private Class</span>
                  <span className={cn("text-xs text-center mt-1", isPremium ? "text-muted-foreground" : "text-muted-foreground/50")}>
                    {isPremium ? 'Paid tutoring sessions' : 'Upgrade to unlock'}
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Class Grade - shown for school type when teacher is in an institution */}
          {isSchoolLinked && (
            <div className="space-y-2">
              <Label>Class / Grade</Label>
              <Select
                value={formData.class_grade}
                onValueChange={(value) => setFormData({ ...formData, class_grade: value })}
              >
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {CLASS_GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.class_grade && (
                <div className="flex items-center gap-2 p-2.5 rounded-md bg-primary/5 border border-primary/10">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-sm text-primary">
                    <span className="font-semibold">{matchingStudentCount}</span> student{matchingStudentCount !== 1 ? 's' : ''} in {formData.class_grade} will be auto-enrolled
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name" placeholder="e.g., JHS 2 Mathematics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
              <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description {isPrivate ? '(Required)' : '(Optional)'}
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your class..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              required={isPrivate}
            />
          </div>

          {isPrivate && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label>Fee & Frequency</Label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      id="monthly_fee" type="number" min="0" step="0.01" placeholder="0.00"
                      value={formData.monthly_fee}
                      onChange={(e) => setFormData({ ...formData, monthly_fee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <Select
                    value={formData.fee_frequency || 'monthly'}
                    onValueChange={(value: FeeFrequency) => setFormData({ ...formData, fee_frequency: value })}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_students">Maximum Students</Label>
                <Input
                  id="max_students" type="number" min="1" max="100"
                  value={formData.max_students}
                  onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) || 50 })}
                />
              </div>
            </div>
          )}

          {isSchoolLinked && !isPrivate && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 border">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your school has been onboarded. Students in the selected class will be automatically added to this classroom.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !formData.name || !formData.subject || (isPrivate && !formData.description?.trim())}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Classroom
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassroomModal;
