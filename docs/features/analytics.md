# Analytics & Productivity Scoring

> **Status: Scaffold Only.** The dashboard API supplies current aggregates, but there is no analytics module or historical-series endpoint. The current chart component explicitly derives mock weekly points and the analytics page supplies hard-coded fallback KPIs. This document describes intended behavior, not a completed analytics feature.

Orbit provides built-in productivity analytics directly from the dashboard to help users track their progress over time without feeling overwhelmed by complex charts.

## Core Metrics

- **Tasks Completed Today**: The total number of tasks marked as `DONE` today.
- **Focus Time Today**: The total duration (in minutes/hours) of `COMPLETED` study blocks today.
- **Habit Completion %**: The percentage of habits that were completed today.
- **Current Streak**: The maximum streak achieved among active habits.

## Productivity Score

The Weekly Productivity Score is a unified metric (0-100) that gives users a quick sense of how productive they've been.

### Formula

The score is composed of four weighted categories:

1. **Tasks (40%)**: `Math.min(tasksCompletedToday / 5, 1) * 40` (Baseline: 5 tasks)
2. **Habits (30%)**: `Math.min(habitsCompletedToday / 3, 1) * 30` (Baseline: 3 habits)
3. **Focus (20%)**: `Math.min(focusTimeToday / 120, 1) * 20` (Baseline: 2 hours)
4. **Consistency (10%)**: `Math.min(currentStreak / 5, 1) * 10` (Baseline: 5 days)

_Total Score = Tasks Score + Habits Score + Focus Score + Consistency Score_

## Charts

The dashboard features lightweight charts powered by `recharts`:

- **Weekly Focus Hours**: A bar chart displaying focus time accumulated each day of the week.
- **Tasks Completed**: A bar chart showing the volume of tasks finished throughout the week.

## Future Enhancements

- Historical data retention for monthly and yearly views.
- Gamification elements (XP, Levels) tied directly to the Productivity Score.
