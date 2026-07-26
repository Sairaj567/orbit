# Calendar Feature

## Purpose

A unified calendar view aggregating Tasks, Habits, and Study Blocks.

## Status

Partial. A client-side month grid and selected-day task agenda exist. There is no calendar API, date-range aggregation, habit/study/event data, or calendar-specific realtime integration.

## Dependencies

- Tasks, Habits, Study features

## Database models

- N/A (Derived view from other models)

## API endpoints

- `GET /api/workspaces/:workspaceId/calendar?start=...&end=...`

## UI components

- `MonthView`
- `WeekView`
- `DayView`
- `EventPopover`

## Future enhancements

- iCal feed export
- Google Calendar 2-way sync

## Known limitations

- Initial version is read-only (clicking opens the entity's own detail view).

## Implementation checklist

- [ ] Build aggregator API endpoint in NestJS
- [ ] Implement Calendar UI components
- [ ] Integrate React Query for date-range fetching
