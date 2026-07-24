import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TaskForm } from './task-form';
import { useCreateTask } from '../hooks/use-tasks';
import { toast } from 'sonner';
import type { CreateTaskInput } from '@orbit/shared';

interface CreateTaskDialogProps {
  workspaceId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  projectId?: string;
}

export function CreateTaskDialog({ workspaceId, open, onOpenChange, projectId }: CreateTaskDialogProps) {
  const { mutateAsync: createTask, isPending } = useCreateTask(workspaceId);

  const handleSubmit = async (data: CreateTaskInput) => {
    try {
      await createTask({
        ...data,
        projectId: projectId || data.projectId,
      });
      toast.success('Task created successfully');
      onOpenChange?.(false);
    } catch (error) {
      toast.error('Failed to create task');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task to your workspace.
          </DialogDescription>
        </DialogHeader>
        <TaskForm onSubmit={handleSubmit} isLoading={isPending} workspaceId={workspaceId} />
      </DialogContent>
    </Dialog>
  );
}
