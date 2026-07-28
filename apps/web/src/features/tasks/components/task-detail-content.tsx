import type { Task, UpdateTaskInput } from '@orbit/shared';
import { TaskForm } from './task-form';
import { ResourceList } from '../../resources/components/resource-list';
import { AiSummaryCard } from '../../ai/components/AiSummaryCard';
import { CommentList } from './comment-list';
import { useUpdateTask } from '@/features/tasks/hooks/use-tasks';
import { Separator } from '@/components/ui/separator';

interface TaskDetailContentProps {
  task: Task;
  workspaceId: string;
  onUpdateSuccess?: () => void;
}

export function TaskDetailContent({ task, workspaceId, onUpdateSuccess }: TaskDetailContentProps) {
  const { mutate: updateTask, isPending } = useUpdateTask(workspaceId);

  const handleSubmit = (data: UpdateTaskInput) => {
    updateTask(
      { id: task.id, data },
      {
        onSuccess: () => {
          if (onUpdateSuccess) {
            onUpdateSuccess();
          }
        },
      },
    );
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-1 p-6 space-y-6">
        <TaskForm
          key={task.id}
          initialData={task}
          onSubmit={handleSubmit}
          isLoading={isPending}
          workspaceId={workspaceId}
        />

        <div className="pt-2">
          <AiSummaryCard
            workspaceId={workspaceId}
            textToSummarize={`${task.title}\n${task.description || ''}`}
            existingSummary={task.aiSummary || undefined}
          />
        </div>

        <ResourceList workspaceId={workspaceId} taskId={task.id} resources={task.resources} />

        <Separator className="my-6" />

        <CommentList taskId={task.id} />
      </div>
    </div>
  );
}
