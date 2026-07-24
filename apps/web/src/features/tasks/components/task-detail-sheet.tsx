import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Task, UpdateTaskInput } from '@orbit/shared';
import { TaskForm } from './task-form';
import { ResourceList } from '../../resources/components/resource-list';
import { AiSummaryCard } from '../../ai/components/AiSummaryCard';
import { useUpdateTask } from '@/features/tasks/hooks/use-tasks';

interface TaskDetailSheetProps {
  task: Task | null;
  workspaceId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({ task, workspaceId, isOpen, onOpenChange }: TaskDetailSheetProps) {
  const { mutate: updateTask, isPending } = useUpdateTask(workspaceId);

  if (!task) return null;

  const handleSubmit = (data: UpdateTaskInput) => {
    updateTask({ id: task.id, data }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Task Details</SheetTitle>
        </SheetHeader>
        
        {/* We use key={task.id} to force TaskForm to re-initialize its state when a new task is selected */}
        <TaskForm 
          key={task.id}
          initialData={task} 
          onSubmit={handleSubmit} 
          isLoading={isPending} 
          workspaceId={workspaceId}
        />
        
        <div className="mt-6 mb-6">
          <AiSummaryCard 
            workspaceId={workspaceId} 
            textToSummarize={`${task.title}\n${task.description || ''}`} 
            existingSummary={task.aiSummary || undefined} 
          />
        </div>

        <ResourceList 
          workspaceId={workspaceId} 
          taskId={task.id} 
          resources={task.resources} 
        />
      </SheetContent>
    </Sheet>
  );
}
