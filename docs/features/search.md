# Global Search & Command Palette

## Overview

Orbit features a global command palette (accessed via `Cmd+K` / `Ctrl+K`) that provides fast, keyboard-centric navigation across the workspace.

## Scope (V1)

- **Client-Side Only**: The search operates over data currently cached by React Query on the frontend.
- **Supported Entities**: Projects, Tasks, Notes, Resources.
- **Recent Items**: Displays the last 10 clicked items when the search input is empty.

## Architecture

- **`cmdk`**: Core accessible command menu primitive.
- **`shadcn/ui`**: Styling and integration components (`CommandDialog`, `CommandInput`, `CommandList`, etc.).
- **`useGlobalSearch`**: Custom hook that reads `queryClient.getQueriesData()` to extract all entities from the React Query cache and filters them based on the query.
- **`useRecentItems`**: Custom hook backed by `localStorage` to save and retrieve recent navigation targets.

## Future Improvements (V2)

- Backend integration for searching beyond the cached data (e.g., Elasticsearch or Postgres full-text search).
- Adding Habits and Calendar events once implemented.
- Command executions (e.g., "Create Task", "Toggle Dark Mode").
