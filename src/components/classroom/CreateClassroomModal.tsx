import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { School, Briefcase, Loader2 } from 'lucide-react';
import { ClassroomType, CreateClassroomData } from '@/types/classroom';
import { useAuth } from '@/contexts/AuthContext';

interface CreateClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateClassroomData) => Promise<{ error: any }>;
  defaultType?: ClassroomType;
  isPremium?: boolean;
}

const SUBJECTS = [
  'Mathematics',
  'English Language',
  'Science',
  'Social Studies',
  'ICT',
  'Creative Arts',
  'Religious & Moral Education',
  'French',
  'Ghanaian Language',
  'Physical Education',
  'Other',
];

const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  defaultType = 'school',
  isPremium = false,
}) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateClassroomData>({
    name: '',
    description: '',
    subject: profile?.subjects?.[0] || '',
    classroom_type: defaultType,
    monthly_fee: 0,
    max_students: 50,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await onSubmit(formData);
    
    setLoading(false);
    if (!result.error) {
      setFormData({
        name: '',
        description: '',
        subject: profile?.subjects?.[0] || '',
        classroom_type: defaultType,
        monthly_fee: 0,
        max_students: 50,
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
                <RadioGroupItem
                  value="school"
                  id="school"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="school"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <School className="mb-2 h-6 w-6" />
                  <span className="font-medium">School Class</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    For your school students
                  </span>
                </Label>
              </div>
              <div className={`relative ${!isPremium ? 'opacity-50 pointer-events-none' : ''}`}>
                <RadioGroupItem
                  value="private"
                  id="private"
                  className="peer sr-only"
                  disabled={!isPremium}
                />
                <Label
                  htmlFor="private"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Briefcase className="mb-2 h-6 w-6" />
                  <span className="font-medium">Private Class</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    {isPremium ? 'Paid tutoring sessions' : 'Premium plan only'}
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Class Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Class Name</Label>
            <Input
              id="name"
              placeholder="e.g., JHS 2 Mathematics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={formData.subject}
              onValueChange={(value) => setFormData({ ...formData, subject: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your class..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          {/* Private Class Settings */}
          {formData.classroom_type === 'private' && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="monthly_fee">Monthly Fee (GHS)</Label>
                <Input
                  id="monthly_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.monthly_fee}
                  onChange={(e) =>
                    setFormData({ ...formData, monthly_fee: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_students">Maximum Students</Label>
                <Input
                  id="max_students"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_students}
                  onChange={(e) =>
                    setFormData({ ...formData, max_students: parseInt(e.target.value) || 50 })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name || !formData.subject}>
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
