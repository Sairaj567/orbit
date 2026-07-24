import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { Plus } from 'lucide-react';
import type { Task, TaskQueryInput } from '@orbit/shared';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

import { useTasks, useUpdateTask } from '@/features/tasks/hooks/use-tasks';
import { TaskFilters } from '@/features/tasks/components/task-filters';
import { TaskList } from '@/features/tasks/components/task-list';
import { CreateTaskDialog } from '@/features/tasks/components/create-task-dialog';
import { TaskDetailSheet } from '@/features/tasks/components/task-detail-sheet';
import { DeleteTaskDialog } from '@/features/tasks/components/delete-task-dialog';
import { QuickAddTask } from '@/features/tasks/components/quick-add-task';
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';

import { useWorkspaceContext } from '@/components/layout/workspace-context';

const EMPTY_TASKS: Task[] = [];

export function TasksPage() {
  const { workspace } = useWorkspaceContext();
  const workspaceId = workspace.slug;
  const [searchParams] = useSearchParams();
  
  // Parse filters from URL
  const query: Partial<TaskQueryInput> = useMemo(() => ({
    search: searchParams.get('search') || undefined,
    status: (searchParams.get('status') as TaskQueryInput['status']) || undefined,
    priority: (searchParams.get('priority') as TaskQueryInput['priority']) || undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  }), [searchParams]);

  const { data: response, isLoading } = useTasks(workspaceId, query);
  const tasks = response?.data || EMPTY_TASKS;

  const { mutate: updateTask } = useUpdateTask(workspaceId);

  // UI States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQuickAddVisible, setIsQuickAddVisible] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const activeTask = useMemo(() => 
    tasks.find(t => t.id === activeTaskId), 
  [tasks, activeTaskId]);

  const moveActiveIndex = useCallback((step: number) => {
    if (tasks.length === 0) return;
    const currentIndex = tasks.findIndex(t => t.id === activeTaskId);
    let nextIndex = currentIndex + step;
    
    // Clamp
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= tasks.length) nextIndex = tasks.length - 1;
    
    const nextTask = tasks[nextIndex];
    if (nextTask) {
      setActiveTaskId(nextTask.id);
    }
  }, [tasks, activeTaskId]);

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    'c': (e) => {
      e.preventDefault();
      setIsQuickAddVisible(true);
    },
    '/': (e) => {
      e.preventDefault();
      document.getElementById('task-search-input')?.focus();
    },
    'j': () => {
      if (!isCreateOpen && !taskToEdit && !taskToDelete) {
        moveActiveIndex(1);
      }
    },
    'k': () => {
      if (!isCreateOpen && !taskToEdit && !taskToDelete) {
        moveActiveIndex(-1);
      }
    },
    'ArrowDown': (e) => {
      if (!isCreateOpen && !taskToEdit && !taskToDelete) {
        e.preventDefault();
        moveActiveIndex(1);
      }
    },
    'ArrowUp': (e) => {
      if (!isCreateOpen && !taskToEdit && !taskToDelete) {
        e.preventDefault();
        moveActiveIndex(-1);
      }
    },
    'Enter': (e) => {
      if (activeTask && !isCreateOpen && !taskToEdit && !taskToDelete && !isQuickAddVisible) {
        e.preventDefault();
        setTaskToEdit(activeTask);
      }
    },
    ' ': (e) => { // Space
      if (activeTask && !isCreateOpen && !taskToEdit && !taskToDelete && !isQuickAddVisible) {
        e.preventDefault();
        updateTask({ id: activeTask.id, data: { status: activeTask.status === 'DONE' ? 'TODO' : 'DONE' } });
      }
    },
    'Backspace': () => {
      if (activeTask && !isCreateOpen && !taskToEdit && !taskToDelete && !isQuickAddVisible) {
        setTaskToDelete(activeTask);
      }
    },
    'Delete': () => {
      if (activeTask && !isCreateOpen && !taskToEdit && !taskToDelete && !isQuickAddVisible) {
        setTaskToDelete(activeTask);
      }
    },
    'Escape': () => {
      setIsQuickAddVisible(false);
      setActiveTaskId(null);
    }
  });

  const handleToggleCompletion = useCallback((task: Task, isDone: boolean) => {
    updateTask({ id: task.id, data: { status: isDone ? 'DONE' : 'TODO' } });
  }, [updateTask]);

  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100vh-4rem)] pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader title="Tasks" description="Manage your team's tasks." />
        <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          New Task
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border/50 p-4 shadow-sm">
        <TaskFilters />
      </div>

      <div className="flex-1 w-full flex flex-col bg-card rounded-md border shadow-sm overflow-hidden">
        {isQuickAddVisible && (
          <QuickAddTask 
            workspaceId={workspaceId} 
            onClose={() => setIsQuickAddVisible(false)} 
          />
        )}
        
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          activeTaskId={activeTaskId}
          onSelect={(task) => {
            setActiveTaskId(task.id);
            setTaskToEdit(task);
          }}
          onToggleCompletion={handleToggleCompletion}
        />
      </div>

      <CreateTaskDialog
        workspaceId={workspaceId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
      
      <TaskDetailSheet
        workspaceId={workspaceId}
        task={taskToEdit}
        isOpen={!!taskToEdit}
        onOpenChange={(open) => !open && setTaskToEdit(null)}
      />

      <DeleteTaskDialog
        workspaceId={workspaceId}
        task={taskToDelete}
        isOpen={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
      />
    </div>
  );
}