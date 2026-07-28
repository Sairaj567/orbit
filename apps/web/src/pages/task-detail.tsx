import { useParams, useNavigate } from 'react-router';
import { useTask } from '@/features/tasks/hooks/use-tasks';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { TaskDetailContent } from '@/features/tasks/components/task-detail-content';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getWorkspacePath } from '@/lib/routes';

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { workspace } = useWorkspaceContext();
  const navigate = useNavigate();

  const { data: task, isLoading } = useTask(workspace.slug, taskId || '');

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full mt-8" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-semibold mt-8">Task not found</h2>
        <p className="text-muted-foreground mt-2">
          The task you are looking for does not exist or you do not have access.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => navigate(getWorkspacePath(workspace.slug, 'tasks'))}
        >
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] max-w-4xl mx-auto flex flex-col bg-card border-x border-border/50">
      <div className="px-6 py-4 border-b border-border/50 flex items-center shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4 -ml-2 text-muted-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-lg font-semibold truncate">Task Details</h1>
      </div>

      <div className="flex-1 overflow-hidden">
        <TaskDetailContent task={task} workspaceId={workspace.slug} />
      </div>
    </div>
  );
}
