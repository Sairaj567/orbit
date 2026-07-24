# Notes Feature

## Purpose
A contextual, markdown-based note system for Projects and Tasks within a workspace, optimized for speed and simplicity. 

## Status
Completed (Milestone 5.3 — Notes Foundation)

## Dependencies
- `react-markdown` and `@tailwindcss/typography` for markdown rendering

## Database models
- `Note` (id, title, content, isPinned, order, workspaceId, projectId, taskId, authorId)

## API endpoints
- `GET /api/v1/workspaces/:workspaceId/notes`
- `GET /api/v1/workspaces/:workspaceId/notes/:id`
- `POST /api/v1/workspaces/:workspaceId/notes`
- `PATCH /api/v1/workspaces/:workspaceId/notes/:id`
- `DELETE /api/v1/workspaces/:workspaceId/notes/:id`

## UI components
- `NoteCard`
- `NoteList`
- `NoteEditor`
- `CreateNoteDialog`
- `EditNoteDialog`
- `DeleteNoteDialog`

## Future enhancements
- Embedding tasks within notes
- Real-time multiplayer editing (OT/CRDT)
- Version history

## Known limitations
- Current version uses a standard textarea for markdown editing rather than a WYSIWYG editor to prioritize simplicity and avoid heavy dependencies for the beta.

## Implementation checklist
- [x] Define Prisma model
- [x] Create NestJS module
- [x] Implement API endpoints and validation schemas
- [x] Setup SDK Client and hooks in React
- [x] Implement UI components (NoteList, NoteCard, Editor, Dialogs)
- [x] Integrate into Project Dashboard
