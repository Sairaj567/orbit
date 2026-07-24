import type { HabitDTO } from '@orbit/shared';
import { cn } from '@/lib/utils';
import { useToggleHabitComplete } from '../hooks/use-habits';
import { useCreateStudyBlock } from '@/features/study-blocks/hooks/use-study-blocks';
import { Check, Flame, MoreHorizontal, Edit, Trash, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HabitCardProps {
  habit: HabitDTO;
  onEdit?: (habit: HabitDTO) => void;
  onDelete?: (habit: HabitDTO) => void;
}

export function HabitCard({ habit, onEdit, onDelete }: HabitCardProps) {
  const toggleComplete = useToggleHabitComplete(habit.workspaceId);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  // Basic client-side check if completed today
  const lastCompleted = habit.lastCompletedAt ? new Date(habit.lastCompletedAt).getTime() : 0;
  const isCompletedToday = lastCompleted >= todayStart;

  const handleToggle = () => {
    toggleComplete.mutate(habit.id);
  };
  
  const createStudyBlock = useCreateStudyBlock();

  const handleStartFocus = () => {
    createStudyBlock.mutate({
      projectId: habit.projectId,
      habitId: habit.id,
      plannedDuration: 25,
    });
  };

  return (
    <div
      className="group relative flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all duration-200 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggle}
          disabled={toggleComplete.isPending}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
            isCompletedToday 
              ? "bg-green-500 border-green-500 text-white" 
              : "border-zinc-300 dark:border-zinc-700 text-transparent hover:border-green-400 dark:hover:border-green-500"
          )}
        >
          <Check className="w-4 h-4" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {habit.icon && <span className="text-xl">{habit.icon}</span>}
            <h4 className={cn("font-medium text-sm transition-colors", isCompletedToday ? "text-zinc-500 line-through" : "text-zinc-900 dark:text-zinc-100")}>
              {habit.title}
            </h4>
          </div>
          {habit.description && (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{habit.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {habit.streak > 0 && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            habit.streak >= 3 ? "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          )}>
            <Flame className="w-3 h-3" />
            <span>{habit.streak}</span>
          </div>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleStartFocus}
          disabled={createStudyBlock.isPending}
          className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:bg-primary/10"
          title="Start Focus Session"
        >
          <Play className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit && onEdit(habit)} disabled={!onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Habit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete && onDelete(habit)} disabled={!onDelete} className="text-red-600 dark:text-red-400">
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
