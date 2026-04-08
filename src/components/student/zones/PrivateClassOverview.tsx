import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ChevronRight,
  Users,
  Star,
  Clock,
  Calendar,
  BookOpen,
  CheckCircle2,
  Video,
  CreditCard,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ClassroomData {
  id: string;
  name: string;
  subject: string;
  description: string | null;
  teacher_id: string;
  classroom_type: string;
  invite_code: string;
  monthly_fee: number | null;
  currency: string | null;
  created_at?: string;
}

interface PrivateClassOverviewProps {
  classroom: ClassroomData;
  onBack: () => void;
  onJoinSuccess: () => void;
  isAlreadyJoined: boolean;
  isPending: boolean;
}

const CLASS_OUTLINES: Record<string, string[]> = {
  Mathematics: [
    'Number operations & problem solving',
    'Algebraic expressions & equations',
    'Geometry, measurement & spatial reasoning',
    'Data handling & probability',
    'Real-world math applications',
  ],
  Science: [
    'Living organisms & life processes',
    'Matter, materials & their properties',
    'Forces, energy & motion',
    'Earth science & the environment',
    'Scientific investigation & experiments',
  ],
  English: [
    'Reading comprehension & analysis',
    'Creative and expository writing',
    'Grammar, punctuation & vocabulary',
    'Oral communication & presentation',
    'Literature appreciation',
  ],
  default: [
    'Core concepts & fundamentals',
    'Practical exercises & applications',
    'Interactive live sessions with teacher',
    'Weekly assignments & feedback',
    'Exam preparation & revision',
  ],
};

const PrivateClassOverview: React.FC<PrivateClassOverviewProps> = ({
  classroom,
  onBack,
  onJoinSuccess,
  isAlreadyJoined,
  isPending,
}) => {
  const { user } = useAuth();
  const [teacherName, setTeacherName] = useState('Teacher');
  const [teacherAbout, setTeacherAbout] = useState<string | null>(null);
  const [teacherSchool, setTeacherSchool] = useState<string | null>(null);
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [classroom.id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      // Fetch teacher profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, school_name, subjects')
        .eq('user_id', classroom.teacher_id)
        .maybeSingle();

      if (profile) {
        setTeacherName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Teacher');
        setTeacherSchool(profile.school_name || null);
        setTeacherSubjects(profile.subjects || []);
      }

      // Fetch student count
      const { count } = await supabase
        .from('classroom_students')
        .select('*', { count: 'exact', head: true })
        .eq('classroom_id', classroom.id)
        .eq('is_active', true)
        .eq('approval_status', 'approved');

      setStudentCount(count || 0);
    } catch (err) {
      console.error('Error fetching class details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayAndJoin = async () => {
    if (!user) return;
    setIsProcessing(true);

    try {
      // Check not already joined
      const { data: existing } = await supabase
        .from('classroom_students')
        .select('id')
        .eq('classroom_id', classroom.id)
        .eq('student_id', user.id)
        .maybeSingle();

      if (existing) {
        toast.info("You've already requested to join this class");
        setShowPaymentDialog(false);
        setIsProcessing(false);
        return;
      }

      // Insert student enrollment with pending approval
      const { error } = await supabase
        .from('classroom_students')
        .insert({
          classroom_id: classroom.id,
          student_id: user.id,
          approval_status: 'pending',
          subscription_status: 'active',
        });

      if (error) {
        toast.error('Failed to join class');
        console.error(error);
      } else {
        toast.success(`Payment successful! Your request to join ${classroom.name} has been sent 🎉`);
        setShowPaymentDialog(false);
        onJoinSuccess();
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const outline = CLASS_OUTLINES[classroom.subject] || CLASS_OUTLINES.default;
  const fee = classroom.monthly_fee || 0;
  const currency = classroom.currency || 'GHS';
  const startDate = classroom.created_at
    ? new Date(classroom.created_at)
    : new Date();
  const rating = 4.7; // Placeholder rating

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="text-sm">Back to browse</span>
      </button>

      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 p-6 pb-4">
          <Badge variant="secondary" className="mb-3 gap-1">
            <Video className="w-3 h-3" />
            Private Class · Live Sessions
          </Badge>
          <h1 className="text-2xl font-bold mb-1">{classroom.name}</h1>
          <p className="text-muted-foreground">{classroom.subject}</p>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Teacher & Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Teacher</p>
                <p className="font-medium">{teacherName}</p>
              </div>
            </div>

            <Separator orientation="vertical" className="h-8 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-medium">{rating}</span>
              <span className="text-muted-foreground text-xs">rating</span>
            </div>

            <Separator orientation="vertical" className="h-8 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium">{studentCount}</span>
              <span className="text-muted-foreground text-xs">learner{studentCount !== 1 ? 's' : ''}</span>
            </div>

            <Separator orientation="vertical" className="h-8 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground text-xs">Monthly</span>
            </div>
          </div>

          <Separator />

          {/* Teacher Profile */}
          <div className="p-4 rounded-xl bg-muted/50 space-y-3">
            <h3 className="font-semibold text-sm">About the Teacher</h3>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {teacherName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{teacherName}</p>
                {teacherSchool && (
                  <p className="text-xs text-muted-foreground">{teacherSchool}</p>
                )}
              </div>
            </div>
            {teacherSubjects.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Teaches</p>
                <div className="flex flex-wrap gap-1.5">
                  {teacherSubjects.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            {classroom.description && (
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "{classroom.description}"
              </p>
            )}
          </div>

          {/* Description */}
          {classroom.description && (
            <div>
              <h3 className="font-semibold mb-2 text-sm">About this class</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{classroom.description}</p>
            </div>
          )}

          {/* What You'll Learn */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">What you'll learn</h3>
            <div className="space-y-2">
              {outline.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What's Included */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">What's included</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '📖', label: 'Lesson Notes' },
                { icon: '📝', label: 'Practice Homework' },
                { icon: '🎥', label: 'Video Resources' },
                { icon: '📢', label: 'Class Updates' },
                { icon: '🎯', label: 'Live Sessions' },
                { icon: '💬', label: 'Teacher Support' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Class Starts */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Class started</p>
              <p className="text-xs text-muted-foreground">
                {startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Pricing & CTA */}
          <div className="bg-muted/50 rounded-xl p-5 text-center space-y-3">
            <div>
              <p className="text-3xl font-bold">
                {currency} {fee.toFixed(2)}
                <span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">Cancel anytime</p>
            </div>

            {isAlreadyJoined ? (
              <Button className="w-full" size="lg" disabled>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Already Joined
              </Button>
            ) : isPending ? (
              <Button className="w-full" size="lg" variant="secondary" disabled>
                <Clock className="w-5 h-5 mr-2" />
                Approval Pending ⏳
              </Button>
            ) : (
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowPaymentDialog(true)}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Pay & Join Class
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              You're about to join <span className="font-semibold">{classroom.name}</span> by {teacherName}.
            </DialogDescription>
          </DialogHeader>

          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Fee</span>
                <span className="font-semibold">{currency} {fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Billing</span>
                <span>Monthly (recurring)</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Due Now</span>
                <span>{currency} {fee.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full"
              size="lg"
              onClick={handlePayAndJoin}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay {currency} {fee.toFixed(2)}
                </>
              )}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrivateClassOverview;
