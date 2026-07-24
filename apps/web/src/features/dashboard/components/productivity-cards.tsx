import type { DashboardResponse } from '@orbit/shared';
import { Target, Zap, Timer, Flame, TrendingUp } from 'lucide-react';

interface ProductivityCardsProps {
  stats: DashboardResponse['stats'];
}

export function ProductivityCards({ stats }: ProductivityCardsProps) {
  const cards = [
    {
      title: 'Productivity Score',
      value: stats.weeklyProductivityScore,
      icon: <TrendingUp className="h-5 w-5 text-primary" />,
      suffix: '/ 100',
    },
    {
      title: 'Tasks Today',
      value: stats.tasksCompletedToday,
      icon: <Target className="h-5 w-5 text-blue-500" />,
    },
    {
      title: 'Habit Completion',
      value: stats.habitCompletionPercent,
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      suffix: '%',
    },
    {
      title: 'Focus Time',
      value: `${Math.floor(stats.focusTimeToday / 60)}h ${stats.focusTimeToday % 60}m`,
      icon: <Timer className="h-5 w-5 text-purple-500" />,
    },
    {
      title: 'Current Streak',
      value: stats.currentStreak,
      icon: <Flame className="h-5 w-5 text-orange-500" />,
      suffix: ' days',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/70 bg-card/75 p-4 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
            {card.icon}
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {card.value}
            </span>
            {card.suffix && (
              <span className="ml-1 text-sm text-muted-foreground font-medium">{card.suffix}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
