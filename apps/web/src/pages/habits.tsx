import { useState } from 'react';
import { Flame, Plus, Trophy, Target } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { useHabits } from '@/features/habits/hooks/use-habits';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { HabitList } from '@/features/habits/components/habit-list';
import { CreateHabitDialog } from '@/features/habits/components/create-habit-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function HabitsPage() {
  const { workspace } = useWorkspaceContext();
  const { data: habits = [], isLoading } = useHabits(workspace.slug);
  const { data: projectsData } = useProjects(workspace.slug);
  const projects = projectsData?.data || [];

  const [createOpen, setCreateOpen] = useState(false);

  const activeProjectId = projects.length > 0 ? (projects[0]?.id || '') : '';

  const totalHabits = habits.length;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak || 0), 0);
  const totalCompletions = habits.reduce((sum, h) => sum + (h.completionCount || 0), 0);

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Habits"
        description="Build routines, check off daily habits, and maintain streaks."
        actions={
          <Button onClick={handleOpenCreate} disabled={!activeProjectId}>
            <Plus className="w-4 h-4 mr-2" />
            New Habit
          </Button>
        }
      />

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-orange-500/15 rounded-xl text-orange-600 dark:text-orange-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Best Streak</p>
              <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{bestStreak} Days</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-500/15 rounded-xl text-blue-600 dark:text-blue-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Active Habits</p>
              <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalHabits}</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/15 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Check-Ins</p>
              <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalCompletions}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Habit Content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : (
          <HabitList habits={habits} onCreateNew={handleOpenCreate} />
        )}
      </div>

      {activeProjectId && (
        <CreateHabitDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          projectId={activeProjectId}
        />
      )}
    </div>
  );
}