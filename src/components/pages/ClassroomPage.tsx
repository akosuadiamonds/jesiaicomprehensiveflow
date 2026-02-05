import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, School, Briefcase, Users } from 'lucide-react';
import { useClassrooms } from '@/hooks/useClassrooms';
import CreateClassroomModal from '@/components/classroom/CreateClassroomModal';
import ClassroomCard from '@/components/classroom/ClassroomCard';
import ClassroomDetail from '@/components/classroom/ClassroomDetail';
import { Classroom, ClassroomType } from '@/types/classroom';
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

const ClassroomPage: React.FC = () => {
  const { schoolClassrooms, privateClassrooms, loading, createClassroom, deleteClassroom } = useClassrooms();
  const [activeTab, setActiveTab] = useState<ClassroomType>('school');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState<string | null>(null);

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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ClassroomType)}>
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
          <TabsTrigger value="private" className="gap-2">
            <Briefcase className="w-4 h-4" />
            Private Classes
            {privateClassrooms.length > 0 && (
              <span className="ml-1 bg-muted px-2 py-0.5 rounded-full text-xs">
                {privateClassrooms.length}
              </span>
            )}
          </TabsTrigger>
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
      </Tabs>

      <CreateClassroomModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={createClassroom}
        defaultType={activeTab}
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
    </div>
  );
};

export default ClassroomPage;
