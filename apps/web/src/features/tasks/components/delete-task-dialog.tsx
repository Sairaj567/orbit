import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteTask } from '../hooks/use-tasks';
import { toast } from 'sonner';
import type { Task } from '@orbit/shared';

interface DeleteTaskDialogProps {
  workspaceId: string;
  task: Task | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTaskDialog({ workspaceId, task, isOpen, onOpenChange }: DeleteTaskDialogProps) {
  const { mutateAsync: deleteTask, isPending } = useDeleteTask(workspaceId);

  const handleDelete = async () => {
    if (!task) return;
    try {
      await deleteTask(task.id);
      toast.success('Task deleted');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to delete task');
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{task?.title}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button variant="ghost" disabled={isPending}>Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
