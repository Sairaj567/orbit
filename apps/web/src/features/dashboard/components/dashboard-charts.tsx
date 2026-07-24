import type { DashboardResponse } from '@orbit/shared';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardChartsProps {
  stats: DashboardResponse['stats'];
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  // We don't have historical daily data from the backend yet in this simple milestone,
  // so we will show a mock distribution for the week that equals the weekly total to demonstrate the UI.
  // In a future milestone, the backend would return `historicalData: { day: string, tasks: number, focus: number }[]`.
  
  const mockWeeklyData = [
    { name: 'Mon', focus: Math.round(stats.weeklyFocusHours * 0.1), tasks: Math.round(stats.tasksCompletedToday * 0.5) },
    { name: 'Tue', focus: Math.round(stats.weeklyFocusHours * 0.2), tasks: Math.round(stats.tasksCompletedToday * 0.8) },
    { name: 'Wed', focus: Math.round(stats.weeklyFocusHours * 0.15), tasks: Math.round(stats.tasksCompletedToday * 1.2) },
    { name: 'Thu', focus: Math.round(stats.weeklyFocusHours * 0.25), tasks: Math.round(stats.tasksCompletedToday * 1.5) },
    { name: 'Fri', focus: Math.round(stats.weeklyFocusHours * 0.3), tasks: stats.tasksCompletedToday },
    { name: 'Sat', focus: 0, tasks: 0 },
    { name: 'Sun', focus: 0, tasks: 0 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-border/70 bg-card/75 p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Weekly Focus Hours</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockWeeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dx={-10} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="focus" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-border/70 bg-card/75 p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Tasks Completed</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockWeeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dx={-10} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
