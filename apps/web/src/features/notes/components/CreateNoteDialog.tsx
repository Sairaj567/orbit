import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NoteEditor } from './NoteEditor';
import { useCreateNote } from '../hooks/use-notes';

interface CreateNoteDialogProps {
  workspaceId: string;
  projectId: string;
  taskId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateNoteDialog({ workspaceId, projectId, taskId, open, onOpenChange }: CreateNoteDialogProps) {
  const { mutate: createNote, isPending } = useCreateNote(workspaceId);

  const handleSave = (title: string, content: string) => {
    createNote(
      { title, content, projectId, taskId, isPinned: false },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 mt-4">
          <NoteEditor
            onSave={handleSave}
            onCancel={() => onOpenChange(false)}
            isSaving={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
