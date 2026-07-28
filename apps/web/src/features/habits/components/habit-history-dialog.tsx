import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { HabitsClient } from '../api/habits.client';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import type { HabitDTO } from '@orbit/shared';

interface HabitHistoryDialogProps {
  habit: HabitDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HabitHistoryDialog({ habit, open, onOpenChange }: HabitHistoryDialogProps) {
  const { workspace } = useWorkspaceContext();

  const { data, isLoading } = useQuery({
    queryKey: ['habit-history', workspace.slug, habit?.id],
    queryFn: async () => {
      if (!habit) return null;
      // We will add getHistory to HabitsClient
      return HabitsClient.getHistory(workspace.slug, habit.id);
    },
    enabled: !!habit && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Habit History - {habit?.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="flex gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold">{habit?.streak}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Current Streak
              </div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold">{habit?.longestStreak}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Best Streak
              </div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold">{habit?.completionCount}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Completions</h4>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : data?.completions.length === 0 ? (
              <div className="text-sm text-muted-foreground">No completions yet.</div>
            ) : (
              <ul className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
                {data?.completions.map((c: any) => (
                  <li
                    key={c.id}
                    className="text-sm p-2 rounded-md bg-zinc-50 dark:bg-zinc-800 flex justify-between"
                  >
                    <span>✅ Completed</span>
                    <span className="text-muted-foreground">
                      {new Date(c.completedAt).toLocaleDateString()}{' '}
                      {new Date(c.completedAt).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
