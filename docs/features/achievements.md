# Achievements Feature

## Purpose
Gamification engine that awards XP, Levels, and Badges for completing actions in the app.

## Status
Not Started

## Dependencies
- Activity Feature (listens to activity events)

## Database models
- `User` (xp, level fields)
- `UserBadge` (userId, badgeId, unlockedAt)

## API endpoints
- `GET /api/users/:userId/achievements`

## UI components
- `LevelProgress`
- `BadgeShowcase`
- `LevelUpToast`

## Future enhancements
- Workspace-level achievements

## Known limitations
- XP formulas need balancing.

## Implementation checklist
- [ ] Define XP logic and thresholds
- [ ] Implement background workers (BullMQ) to process XP grants
- [ ] Build UI components
