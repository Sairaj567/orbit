# Projects

Projects are the central hub for workspaces. A Project serves as the container for tasks, notes, and resources, acting as a mini-dashboard where users spend the majority of their time in Orbit.

## Current Architecture (Milestone 5.4)

The Project Hub uses nested routing under `/projects/:projectId/` using `react-router`:

### Tabbed Navigation
- **Overview**: Dashboard summary showing recent tasks, notes, and resources.
- **Tasks**: Scoped view specifically for managing the project's tasks.
- **Notes**: Scoped view for creating and managing project notes.
- **Resources**: Scoped view for the project's resource library (links, GitHub, etc).
- **Activity**: (Planned) Feed of recent changes and updates.
- **Settings**: Configuration, archival, and deletion.

## Implementation Details

- **Layout (`layout.tsx`)**: Provides context to child routes using `useOutletContext` and standardizes Breadcrumb + Tabs navigation.
- **Data Sharing**: Fetches project data once in the layout and shares it downwards to prevent N+1 API calls.
- **Styling**: Relies on `shadcn/ui` components (`Tabs`, `Breadcrumb`, `ScrollArea`) to deliver a modern, Linear-inspired aesthetic.
- **Responsive**: Tabs use `ScrollArea` and `ScrollBar` to ensure they are horizontally scrollable on mobile devices.

## Next Steps

- Integrate an Activity feed.
- Further refine the Settings view (add danger zones for deletion).
- Connect the Project Hub back to the main Workspace dashboard via recent activity widgets.
