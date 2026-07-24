import { useState } from 'react';
import { useOutletContext } from 'react-router';
import type { Project } from '@orbit/shared';
import { HabitList } from '@/features/habits/components/habit-list';
import { useHabits } from '@/features/habits/hooks/use-habits';
import { CreateHabitDialog } from '@/features/habits/components/create-habit-dialog';

export function ProjectHabitsPage() {
  const { project, workspaceId } = useOutletContext<{ project: Project; workspaceId: string }>();
  const { data: habits = [], isLoading } = useHabits(workspaceId, project.id);
  
  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) {
    return <div className="p-4 text-sm text-zinc-500">Loading habits...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Habits</h2>
          <p className="text-sm text-zinc-500 mt-1">Track daily habits for this project</p>
        </div>
      </div>

      <HabitList habits={habits} onCreateNew={() => setCreateOpen(true)} />

      <CreateHabitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={project.id}
      />
    </div>
  );
}
