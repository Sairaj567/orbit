import { Calendar, Tag, Repeat, Play } from 'lucide-react';
import type { Task } from '@orbit/shared';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { memo } from 'react';
import { useCreateStudyBlock } from '@/features/study-blocks/hooks/use-study-blocks';

interface TaskListItemProps {
  task: Task;
  isActive?: boolean;
  onSelect?: (task: Task) => void;
  onToggleCompletion?: (task: Task, isDone: boolean) => void;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600 border-slate-200',
  MEDIUM: 'bg-blue-100 text-blue-700 border-blue-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  URGENT: 'bg-red-100 text-red-700 border-red-200',
};

function TaskListItemComponent({ 
  task, 
  isActive, 
  onSelect,
  onToggleCompletion 
}: TaskListItemProps) {
  const isDone = task.status === 'DONE';
  const isCancelled = task.status === 'CANCELLED';

  const handleCheckboxChange = (checked: boolean | string) => {
    onToggleCompletion?.(task, checked === true);
  };

  const createStudyBlock = useCreateStudyBlock();

  const handleStartFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.projectId) return;
    createStudyBlock.mutate({
      projectId: task.projectId,
      taskId: task.id,
      plannedDuration: 25,
    });
  };

  return (
    <div
      onClick={() => onSelect?.(task)}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 text-sm border-b border-border/40 hover:bg-muted/50 cursor-pointer transition-colors outline-none",
        isActive && "bg-muted ring-1 ring-inset ring-primary/20",
        (isDone || isCancelled) && "opacity-60"
      )}
    >
      <div className="flex items-center justify-center flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          checked={isDone} 
          onCheckedChange={handleCheckboxChange}
          className="h-4 w-4 rounded-full"
        />
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 w-20">
        <Badge 
          variant="outline" 
          className={cn("px-1.5 py-0 text-[10px] uppercase font-semibold", priorityColors[task.priority])}
        >
          {task.priority.substring(0, 3)}
        </Badge>
      </div>

      <div className="flex-1 truncate font-medium">
        <span className={cn(
          "transition-all",
          isDone && "line-through text-muted-foreground",
        )}>
          {task.title}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 text-muted-foreground ml-auto hidden sm:flex">
        {task.projectId && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStartFocus}
            disabled={createStudyBlock.isPending}
            className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
            title="Start Focus Session"
          >
            <Play className="h-3 w-3" />
          </Button>
        )}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1.5 max-w-[120px] truncate text-[11px]">
            <Tag className="h-3 w-3" />
            <span className="truncate">{task.tags.join(', ')}</span>
          </div>
        )}
        {task.rrule && (
          <div className="flex items-center gap-1.5 text-[11px] text-blue-500">
            <Repeat className="h-3 w-3" />
          </div>
        )}
        
        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-[11px] w-24 justify-end">
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Use memo to prevent re-rendering all rows when active row changes
export const TaskListItem = memo(TaskListItemComponent);
