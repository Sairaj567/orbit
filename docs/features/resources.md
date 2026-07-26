# Resources Feature

## Purpose

Provide a unified, simple way to attach reference materials (websites, github PRs, youtube videos, pdfs) to tasks and projects.

## Status

Partial. Resource CRUD, URL type inference, task/project attachment, and basic display exist. There is no OpenGraph extraction, preview pipeline, filter/edit UI, or safe persisted-URL rendering.

## Database Model

`Resource` model with unified metadata field. Supported types in V1: `WEBSITE, GITHUB, YOUTUBE, PDF, MARKDOWN`.

## API Endpoints

- `POST /api/v1/workspaces/:workspaceId/resources`
- `GET /api/v1/workspaces/:workspaceId/resources`
- `GET /api/v1/workspaces/:workspaceId/resources/:id`
- `PATCH /api/v1/workspaces/:workspaceId/resources/:id`
- `DELETE /api/v1/workspaces/:workspaceId/resources/:id`

## UI Components

- `ResourceList`: Fast URL input and rendering of resources.
- `ResourceCard`: A premium clickable card that opens the resource natively in a new tab.

## Known Limitations

- V1 does not do deep OpenGraph scraping. It infers type from URL string matching.
- Global Project Library view is deferred to a future milestone. Resources currently only appear on Tasks.
