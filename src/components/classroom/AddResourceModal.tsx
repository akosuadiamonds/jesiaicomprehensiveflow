import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, ClipboardList, FileText, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AddResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroomId: string;
  defaultType?: string;
  onResourceAdded: () => void;
}

interface SavedItem {
  id: string;
  title: string;
  subject: string;
  type: string;
  createdAt: string;
}

const AddResourceModal: React.FC<AddResourceModalProps> = ({
  open, onOpenChange, classroomId, defaultType, onResourceAdded
}) => {
  const { user } = useAuth();
  const [resourceType, setResourceType] = useState(defaultType || 'lesson_plan');
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  // For manual material upload
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialContent, setMaterialContent] = useState('');

  useEffect(() => {
    if (open && user) {
      setSelectedIds([]);
      fetchSavedItems();
    }
  }, [open, resourceType, user]);

  useEffect(() => {
    if (defaultType) setResourceType(defaultType);
  }, [defaultType]);

  const fetchSavedItems = async () => {
    if (!user) return;
    setLoading(true);

    if (resourceType === 'lesson_plan') {
      const { data } = await supabase
        .from('saved_lesson_plans')
        .select('id, subject, strand, created_at')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      setSavedItems((data || []).map((d: any) => ({
        id: d.id, title: `${d.subject} - ${d.strand}`, subject: d.subject,
        type: 'lesson_plan', createdAt: d.created_at,
      })));
    } else if (resourceType === 'test' || resourceType === 'quiz') {
      const { data } = await supabase
        .from('saved_quizzes')
        .select('id, title, subject, type, created_at')
        .eq('teacher_id', user.id)
        .eq('type', resourceType)
        .order('created_at', { ascending: false });
      setSavedItems((data || []).map((d: any) => ({
        id: d.id, title: d.title, subject: d.subject,
        type: d.type, createdAt: d.created_at,
      })));
    } else {
      setSavedItems([]);
    }
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddSelected = async () => {
    if (!user || selectedIds.length === 0) return;
    setAdding(true);

    const items = savedItems.filter(i => selectedIds.includes(i.id));
    const rows = items.map(item => ({
      classroom_id: classroomId,
      teacher_id: user.id,
      title: item.title,
      resource_type: item.type,
      content: { source_id: item.id },
      is_published: true,
    }));

    const { error } = await supabase.from('classroom_resources').insert(rows);
    if (error) {
      toast.error('Failed to add resources');
    } else {
      toast.success(`${rows.length} resource(s) added to classroom`);
      onResourceAdded();
      onOpenChange(false);
    }
    setAdding(false);
  };

  const handleAddMaterial = async () => {
    if (!user || !materialTitle.trim()) return;
    setAdding(true);

    const { error } = await supabase.from('classroom_resources').insert({
      classroom_id: classroomId,
      teacher_id: user.id,
      title: materialTitle,
      resource_type: 'material',
      content: { text: materialContent },
      is_published: true,
    });

    if (error) {
      toast.error('Failed to upload material');
    } else {
      toast.success('Material added to classroom');
      setMaterialTitle('');
      setMaterialContent('');
      onResourceAdded();
      onOpenChange(false);
    }
    setAdding(false);
  };

  const typeIcon = (type: string) => {
    if (type === 'lesson_plan') return <BookOpen className="h-4 w-4 text-primary" />;
    if (type === 'test' || type === 'quiz') return <ClipboardList className="h-4 w-4 text-primary" />;
    return <FileText className="h-4 w-4 text-primary" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Resource to Classroom</DialogTitle>
          <DialogDescription>
            Select from your saved content or upload new material.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Resource Type</Label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lesson_plan">Lesson Plans</SelectItem>
                <SelectItem value="test">Tests</SelectItem>
                <SelectItem value="quiz">Quizzes</SelectItem>
                <SelectItem value="material">Upload Material</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {resourceType === 'material' ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g. Chapter 3 Notes" value={materialTitle}
                  onChange={e => setMaterialTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Content (optional)</Label>
                <textarea className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Paste notes or content here..."
                  value={materialContent} onChange={e => setMaterialContent(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleAddMaterial}
                disabled={adding || !materialTitle.trim()}>
                {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                Upload Material
              </Button>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : savedItems.length === 0 ? (
                <div className="text-center py-8">
                  {typeIcon(resourceType)}
                  <p className="text-muted-foreground mt-2">
                    No saved {resourceType.replace('_', ' ')}s found. Create one first in the{' '}
                    {resourceType === 'lesson_plan' ? 'Planner' : 'Test'} section.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {savedItems.map(item => (
                    <div key={item.id}
                      onClick={() => toggleSelect(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedIds.includes(item.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/30'
                      }`}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        selectedIds.includes(item.id)
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      }`}>
                        {selectedIds.includes(item.id) && <Check className="w-3 h-3" />}
                      </div>
                      {typeIcon(item.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.subject} · {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {savedItems.length > 0 && (
                <Button className="w-full" onClick={handleAddSelected}
                  disabled={adding || selectedIds.length === 0}>
                  {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Add {selectedIds.length} Selected Resource{selectedIds.length !== 1 ? 's' : ''}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddResourceModal;
