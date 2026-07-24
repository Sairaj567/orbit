import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { useTasks } from '@/features/tasks/hooks/use-tasks';
import { TaskListItem } from '@/features/tasks/components/task-list-item';
import { CreateTaskDialog } from '@/features/tasks/components/create-task-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Project } from '@orbit/shared';

export function ProjectTasksPage() {
  const { project, workspaceId } = useOutletContext<{ project: Project; workspaceId: string }>();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const { data: tasksData, isLoading } = useTasks(workspaceId, { projectId: project.id });
  const tasks = tasksData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Button size="sm" onClick={() => setIsTaskDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      <CreateTaskDialog 
        workspaceId={workspaceId} 
        projectId={project.id} 
        open={isTaskDialogOpen} 
        onOpenChange={setIsTaskDialogOpen} 
      />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h3 className="mt-4 text-lg font-semibold">Create your first task</h3>
          <p className="mt-2 text-sm text-muted-foreground mb-4">
            Break down your project into actionable steps.
          </p>
          <Button onClick={() => setIsTaskDialogOpen(true)}>Add Task</Button>
        </div>
      ) : (
        <div className="space-y-1 bg-card border rounded-xl p-2 shadow-sm">
          {tasks.map(task => (
            <TaskListItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
