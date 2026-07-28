import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Task } from '@orbit/shared';
import { TaskDetailContent } from './task-detail-content';

interface TaskDetailSheetProps {
  task: Task | null;
  workspaceId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({ task, workspaceId, isOpen, onOpenChange }: TaskDetailSheetProps) {
  if (!task) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl p-0 flex flex-col h-full">
        <SheetHeader className="px-6 py-4 border-b border-border/50 shrink-0">
          <SheetTitle>Task Details</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          <TaskDetailContent
            task={task}
            workspaceId={workspaceId}
            onUpdateSuccess={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
