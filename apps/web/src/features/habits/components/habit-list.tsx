import type { HabitDTO } from '@orbit/shared';
import { HabitCard } from './habit-card';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { useDeleteHabit } from '../hooks/use-habits';
import { EditHabitDialog } from './edit-habit-dialog';
import { useState, useMemo } from 'react';
import { Plus, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface HabitListProps {
  habits: HabitDTO[];
  onCreateNew?: () => void;
}

export function HabitList({ habits, onCreateNew }: HabitListProps) {
  const { workspace } = useWorkspaceContext();
  const deleteHabit = useDeleteHabit(workspace.slug);

  const [editingHabit, setEditingHabit] = useState<HabitDTO | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const filteredHabits = useMemo(() => {
    return habits.filter((h) => showArchived || !h.archived);
  }, [habits, showArchived]);

  const handleDelete = (habit: HabitDTO) => {
    if (confirm(`Are you sure you want to delete the habit "${habit.title}"?`)) {
      deleteHabit.mutate(habit.id);
    }
  };

  if (filteredHabits.length === 0 && habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20 border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🌱</span>
        </div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No habits yet</h3>
        <p className="text-sm text-zinc-500 max-w-sm mt-1 mb-4">
          Create habits to build consistent routines and track your daily progress in this project.
        </p>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create Habit
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex items-center space-x-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Archive className="w-4 h-4 text-zinc-500" />
          <Label htmlFor="show-archived" className="text-xs font-medium cursor-pointer">
            Show Archived
          </Label>
          <Switch
            id="show-archived"
            checked={showArchived}
            onCheckedChange={setShowArchived}
            className="scale-75 origin-right"
          />
        </div>
      </div>

      {filteredHabits.length === 0 ? (
        <div className="text-center p-8 text-sm text-zinc-500 border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
          No habits matching the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={setEditingHabit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <EditHabitDialog
        habit={editingHabit}
        open={!!editingHabit}
        onOpenChange={(open) => !open && setEditingHabit(null)}
      />
    </div>
  );
}
