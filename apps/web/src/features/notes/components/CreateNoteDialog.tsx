import { lazy, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateNote } from '../hooks/use-notes';

const NoteEditor = lazy(() => import('./NoteEditor').then((m) => ({ default: m.NoteEditor })));

interface CreateNoteDialogProps {
  workspaceId: string;
  projectId: string;
  taskId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateNoteDialog({
  workspaceId,
  projectId,
  taskId,
  open,
  onOpenChange,
}: CreateNoteDialogProps) {
  const { mutate: createNote, isPending } = useCreateNote(workspaceId);

  const handleSave = (title: string, content: string, newProjectId: string) => {
    createNote(
      { title, content, projectId: newProjectId, taskId, isPinned: false },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
        </DialogHeader>

        <div className="flex-1 mt-4">
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
            <NoteEditor
              initialProjectId={projectId}
              onSave={handleSave}
              onCancel={() => onOpenChange(false)}
              isSaving={isPending}
            />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
}
