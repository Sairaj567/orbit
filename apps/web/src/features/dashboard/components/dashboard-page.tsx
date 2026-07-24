import { PageHeader } from '@/components/layout/page-header';
import { useDashboard } from '../hooks/use-dashboard';
import { ProductivityCards } from './productivity-cards';
import { DashboardCharts } from './dashboard-charts';
import { RecentProjects } from './recent-projects';
import { ActivityItem } from '@/features/activity/components/activity-item';
import { TaskListItem } from '@/features/tasks/components/task-list-item';
import { HabitCard } from '@/features/habits/components/habit-card';
import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function Dashboard() {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <PageHeader title="Dashboard" description="Loading your productivity command center..." />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive">
        <Sparkles className="h-8 w-8" />
        <p className="font-medium">Failed to load dashboard data.</p>
      </div>
    );
  }

  const { today, stats, projects, activity } = dashboard;

  return (
    <div className="space-y-10 pb-10">
      <PageHeader
        title="Command Center"
        description="High-level workspace activity, focus metrics, and productivity insights."
      />

      <ProductivityCards stats={stats} />
      
      <DashboardCharts stats={stats} />
      
      <RecentProjects projects={projects} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Tasks */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Today's Tasks</h3>
          {today.tasks.length === 0 && today.overdueTasks.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/50 text-sm text-muted-foreground">
              No tasks due today. You're all caught up!
            </div>
          ) : (
            <div className="rounded-xl border border-border/70 bg-card shadow-sm overflow-hidden divide-y divide-border/50">
              {today.overdueTasks.map(task => (
                <TaskListItem key={task.id} task={task} />
              ))}
              {today.tasks.map(task => (
                <TaskListItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Today's Habits */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Today's Habits</h3>
          {today.habits.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/50 text-sm text-muted-foreground">
              No habits tracked yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {today.habits.slice(0, 4).map(habit => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">Recent Activity</h3>
        <div className="rounded-xl border border-border/70 bg-card/75 p-5 shadow-sm">
          {activity.length === 0 ? (
             <p className="text-sm text-muted-foreground">No recent activity found.</p>
          ) : (
            <div className="divide-y">
              {activity.map((act) => (
                <ActivityItem key={act.id} activity={act} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
