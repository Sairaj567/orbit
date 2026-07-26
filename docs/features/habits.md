# Habits Feature

## Purpose

Track recurring daily/weekly habits and build streaks, optionally shared with workspace members for accountability.

## Status

Partial. CRUD, completion records, streak counters, project permissions, React Query hooks, and create/edit UI exist. Recurrence enforcement/configuration, timezone-correct streak computation, history/statistics, and realtime client refresh remain incomplete.

## Dependencies

- Tasks feature (for underlying completion logic)

## Database models

- `Habit` (id, name, frequency, icon, color, workspaceId, userId)
- `HabitLog` (id, habitId, date, completed)

## API endpoints

- `GET /api/workspaces/:workspaceId/habits`
- `POST /api/workspaces/:workspaceId/habits`
- `POST /api/workspaces/:workspaceId/habits/:id/log`

## UI components

- `HabitGrid`
- `HabitHeatmap`
- `CreateHabitModal`

## Future enhancements

- Intelligent reminders
- Social leaderboards for habit consistency

## Known limitations

- Complex custom frequencies (e.g., "every 3rd Tuesday") not supported initially.

## Implementation checklist

- [ ] Define Prisma model
- [ ] Create NestJS module, controller, service
- [ ] Build React Query hooks
- [ ] Implement UI components
