import type { HabitDTO } from '@orbit/shared';
import { HabitCard } from './habit-card';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { useDeleteHabit } from '../hooks/use-habits';
import { EditHabitDialog } from './edit-habit-dialog';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HabitListProps {
  habits: HabitDTO[];
  onCreateNew?: () => void;
}

export function HabitList({ habits, onCreateNew }: HabitListProps) {
  const { workspace } = useWorkspaceContext();
  const deleteHabit = useDeleteHabit(workspace.slug);

  const [editingHabit, setEditingHabit] = useState<HabitDTO | null>(null);

  const handleDelete = (habit: HabitDTO) => {
    if (confirm(`Are you sure you want to delete the habit "${habit.title}"?`)) {
      deleteHabit.mutate(habit.id);
    }
  };

  if (habits.length === 0) {
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
    <>
      <div className="space-y-3">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onEdit={setEditingHabit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <EditHabitDialog
        habit={editingHabit}
        open={!!editingHabit}
        onOpenChange={(open) => !open && setEditingHabit(null)}
      />
    </>
  );
}
