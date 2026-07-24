import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '@orbit/shared';
import { TaskListItem } from './task-list-item';
import { Skeleton } from '@/components/ui/skeleton';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  activeTaskId?: string | null;
  onSelect?: (task: Task) => void;
  onToggleCompletion?: (task: Task, isDone: boolean) => void;
}

export function TaskList({ 
  tasks, 
  isLoading, 
  activeTaskId,
  onSelect,
  onToggleCompletion
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[52px] w-full rounded-sm" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed bg-muted/20">
        <div className="rounded-full bg-primary/10 p-3 mb-4">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold tracking-tight">No tasks found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Press <kbd className="px-1.5 py-0.5 rounded-md bg-muted border text-xs font-mono mx-1">C</kbd> or click "New Task" to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-md border bg-card shadow-sm overflow-hidden">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <TaskListItem 
              task={task} 
              isActive={task.id === activeTaskId}
              onSelect={onSelect}
              onToggleCompletion={onToggleCompletion}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
