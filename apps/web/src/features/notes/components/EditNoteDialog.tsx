import { lazy, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useUpdateNote } from '../hooks/use-notes';
import type { Note } from '@orbit/shared';

const NoteEditor = lazy(() => import('./NoteEditor').then((m) => ({ default: m.NoteEditor })));

interface EditNoteDialogProps {
  workspaceId: string;
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditNoteDialog({ workspaceId, note, open, onOpenChange }: EditNoteDialogProps) {
  const { mutate: updateNote, isPending } = useUpdateNote(workspaceId);

  const handleSave = (title: string, content: string, newProjectId: string) => {
    if (!note) return;
    updateNote(
      { id: note.id, data: { title, content, projectId: newProjectId } },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>

        <div className="flex-1 mt-4">
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-xl" />}>
            <NoteEditor
              initialTitle={note.title}
              initialContent={note.content}
              initialProjectId={note.projectId}
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
