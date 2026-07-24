# Tasks Feature

## Purpose
Provide a collaborative checklist and task management system for workspaces.

## Status
Backend, API Client, and highly-polished Frontend UI Complete (Milestone 3.3)

## Dependencies
- Prisma ORM
- Clerk Auth
- React Query

## Database models
- **Prisma Schema**: `Task`, `Category`, `TaskAssignee`, `TaskResource`, `TaskComment` models established.
  - *Note on Search Indexing*: The current schema uses Prisma's `mode: 'insensitive'` for `title` and `description` searching. For optimal performance in PostgreSQL, it is recommended to add a GIN/GiST `pg_trgm` index on these text fields. Since Prisma does not natively support GIN text indexes without raw SQL or preview extensions, this is left as a future migration optimization to be executed when text search latency becomes a concern.

## API endpoints
- `GET /api/v1/workspaces/:workspaceId/tasks`
- `POST /api/v1/workspaces/:workspaceId/tasks`
- `GET /api/v1/workspaces/:workspaceId/tasks/:id`
- `PATCH /api/v1/workspaces/:workspaceId/tasks/:id`
- `DELETE /api/v1/workspaces/:workspaceId/tasks/:id`

## UI components
- `TaskList`
- `TaskCard`
- `CreateTaskDialog`
- `TaskDetailSheet`

## Future enhancements
- Board view (Kanban)
- Subtasks

## Known limitations
- Currently no recurring tasks.

## Implementation checklist
- [x] Define Prisma model
- [x] Create NestJS module, controller, service
- [x] Build React Query hooks
- [x] Implement UI components (TaskList, QuickAdd, DetailSheet, Keyboard Shortcuts)
