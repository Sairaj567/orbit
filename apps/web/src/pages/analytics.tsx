import { ChartNoAxesCombined, TrendingUp, Zap, Clock, Target } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';
import { DashboardCharts } from '@/features/dashboard/components/dashboard-charts';
import { ProductivityCards } from '@/features/dashboard/components/productivity-cards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AnalyticsPage() {
  const { data: dashboardData, isLoading } = useDashboard();

  const stats = dashboardData?.stats || {
    weeklyProductivityScore: 85,
    tasksCompletedToday: 4,
    habitCompletionPercent: 75,
    focusTimeToday: 120,
    currentStreak: 5,
    weeklyFocusHours: 12,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Productivity"
        description="Comprehensive workspace metrics, task completion velocity, and focus analytics."
      />

      {/* Primary KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : (
        <ProductivityCards stats={stats} />
      )}

      {/* Analytics Charts */}
      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Weekly Productivity Trends
            </h3>
          </div>
          <DashboardCharts stats={stats} />
        </div>
      )}

      {/* Productivity Score Breakdown Card */}
      <Card className="border-border shadow-sm bg-gradient-to-r from-primary/5 via-background to-blue-500/5">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Productivity Formula Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <Target className="w-4 h-4 text-blue-500" />
              Task Execution (40%)
            </div>
            <p className="text-2xl font-extrabold text-foreground">{stats.tasksCompletedToday} / Day</p>
            <p className="text-xs text-muted-foreground">High completion rate adds up to 40 pts</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <Clock className="w-4 h-4 text-emerald-500" />
              Focus Depth (40%)
            </div>
            <p className="text-2xl font-extrabold text-foreground">{stats.weeklyFocusHours} Hours / Wk</p>
            <p className="text-xs text-muted-foreground">Deep work study blocks add up to 40 pts</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <ChartNoAxesCombined className="w-4 h-4 text-indigo-500" />
              Habit Consistency (20%)
            </div>
            <p className="text-2xl font-extrabold text-foreground">{stats.habitCompletionPercent}% Rate</p>
            <p className="text-xs text-muted-foreground">Daily habit streaks add up to 20 pts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}