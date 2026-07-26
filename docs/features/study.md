# Study Feature

## Purpose

Focus timers and study blocks (e.g., Pomodoro) shared among workspace members to encourage co-working.

## Status

Functional but Missing Polish. Personal study-block create/active/update/complete/cancel APIs, timer UI, and project linkage exist. There is no synchronized shared timer, history, pause, auto-completion, or reliable realtime cache refresh.

## Dependencies

- Real-time WebSockets (for synced timers)

## Database models

- `StudyBlock` (id, title, duration, startTime, endTime, workspaceId)
- `StudyParticipant` (blockId, userId)

## API endpoints

- `POST /api/workspaces/:workspaceId/study`
- Socket: `timer.start`, `timer.pause`, `timer.stop`

## UI components

- `FocusTimer`
- `ParticipantList`
- `StudySessionHistory`

## Future enhancements

- Ambient background sounds integration.
- Video/audio huddles.

## Known limitations

- Cannot run multiple synchronized study blocks per workspace simultaneously.

## Implementation checklist

- [ ] Define Prisma model
- [ ] Create NestJS Socket gateway for timers
- [ ] Implement client-side timer sync logic
- [ ] Implement UI components
