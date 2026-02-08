import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, School, Briefcase, Users, Lock, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { useClassrooms } from '@/hooks/useClassrooms';
import { useAuth } from '@/contexts/AuthContext';
import CreateClassroomModal from '@/components/classroom/CreateClassroomModal';
import ClassroomCard from '@/components/classroom/ClassroomCard';
import ClassroomDetail from '@/components/classroom/ClassroomDetail';
import { Classroom, ClassroomType } from '@/types/classroom';
import UpgradePlanModal from '@/components/upgrade/UpgradePlanModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ClassroomTab = 'school' | 'private' | 'monetization';

const ClassroomPage: React.FC = () => {
  const { schoolClassrooms, privateClassrooms, loading, createClassroom, deleteClassroom } = useClassrooms();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<ClassroomTab>('school');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isPremium = profile?.selected_plan === 'premium';

  const handleTabChange = (tab: string) => {
    if ((tab === 'private' || tab === 'monetization') && !isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    setActiveTab(tab as ClassroomTab);
  };

  const handleViewClassroom = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
  };

  const handleDeleteClick = (classroomId: string) => {
    setClassroomToDelete(classroomId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (classroomToDelete) {
      await deleteClassroom(classroomToDelete);
      setDeleteDialogOpen(false);
      setClassroomToDelete(null);
    }
  };

  if (selectedClassroom) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <ClassroomDetail
          classroom={selectedClassroom}
          onBack={() => setSelectedClassroom(null)}
        />
      </div>
    );
  }

  const renderEmptyState = (type: ClassroomType) => (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          {type === 'school' ? (
            <School className="w-8 h-8 text-primary" />
          ) : (
            <Briefcase className="w-8 h-8 text-primary" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {type === 'school' ? 'No School Classes Yet' : 'No Private Classes Yet'}
        </h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {type === 'school'
            ? 'Create a class for your school students. Share lesson plans, tests, and track their progress.'
            : 'Start earning by creating private tutoring classes. Set your own fees and manage your students.'}
        </p>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create {type === 'school' ? 'School' : 'Private'} Class
        </Button>
      </CardContent>
    </Card>
  );

  const renderClassrooms = (classrooms: Classroom[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classrooms.map((classroom) => (
        <ClassroomCard
          key={classroom.id}
          classroom={classroom}
          onView={handleViewClassroom}
          onDelete={handleDeleteClick}
        />
      ))}
    </div>
  );

  const renderMonetizationTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">GHS 0.00</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paying Students</p>
                <p className="text-2xl font-bold text-foreground">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-foreground">GHS 0.00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Monetization Dashboard</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Track your earnings from private classes. Create private classes with monthly fees and start earning from your tutoring sessions.
          </p>
          {privateClassrooms.length === 0 && (
            <Button onClick={() => { setActiveTab('private'); setShowCreateModal(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Private Class
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Classroom
          </h1>
          <p className="text-muted-foreground">
            Manage your classes and track student progress
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Classroom
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="school" className="gap-2">
            <School className="w-4 h-4" />
            School Classes
            {schoolClassrooms.length > 0 && (
              <span className="ml-1 bg-muted px-2 py-0.5 rounded-full text-xs">
                {schoolClassrooms.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="private" className="gap-2 relative" disabled={!isPremium}>
            <Briefcase className="w-4 h-4" />
            Private Classes
            {!isPremium && <Lock className="w-3.5 h-3.5 text-muted-foreground/60" />}
            {isPremium && privateClassrooms.length > 0 && (
              <span className="ml-1 bg-muted px-2 py-0.5 rounded-full text-xs">
                {privateClassrooms.length}
              </span>
            )}
          </TabsTrigger>
          {isPremium && (
            <TabsTrigger value="monetization" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Monetization
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="school">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : schoolClassrooms.length === 0 ? (
            renderEmptyState('school')
          ) : (
            renderClassrooms(schoolClassrooms)
          )}
        </TabsContent>

        {isPremium && (
          <>
            <TabsContent value="private">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : privateClassrooms.length === 0 ? (
                renderEmptyState('private')
              ) : (
                renderClassrooms(privateClassrooms)
              )}
            </TabsContent>

            <TabsContent value="monetization">
              {renderMonetizationTab()}
            </TabsContent>
          </>
        )}
      </Tabs>

      <CreateClassroomModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={createClassroom}
        defaultType={activeTab === 'private' ? 'private' : 'school'}
        isPremium={isPremium}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Classroom?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All students, resources, and announcements in this classroom will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradePlanModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal}
        requiredPlan="premium"
        featureName="Private Classes & Monetization"
      />
    </div>
  );
};

export default ClassroomPage;
