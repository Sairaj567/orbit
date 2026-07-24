# 14 Changelog

## [Unreleased]
- **Orbit Platform Completion (Milestones 7-9)**:
  - **Habits Page**: Built complete habit tracking dashboard with streak stats cards, active habit list, and creation/edit dialogs.
  - **Notes Page**: Built workspace notes application with pinned notes section, search filter, and note editor/creator dialogs.
  - **Study Focus Mode**: Built interactive Focus & Pomodoro Studio with 15/25/45/60-min presets, active countdown, project linkage, and note capture.
  - **Calendar Schedule View**: Built multi-view workspace calendar mapping task deadlines and agendas with day navigation.
  - **Analytics & Productivity Insights**: Built productivity command center with Recharts metrics for weekly focus hours, task velocity, and formula score breakdowns.
  - **Achievements & Gamification**: Built Gamification Hub with user Level progress bar, XP rank badges, and unlockable achievement milestone cards.
  - **Activity Stream Feed**: Integrated live workspace audit trail feed with actor details, action filters, and pagination.
  - **User Settings & Preferences**: Built user account settings with display name, email, timezone selector, and light/dark theme switcher.
- **Milestone 7.2 (Dashboard, Insights & Productivity Analytics)**:
  - Built a comprehensive command center for the workspace, replacing the empty state dashboard.
  - Built a comprehensive command center for the workspace, replacing the empty state dashboard.
  - Developed `DashboardService` to aggregate tasks, habits, projects, and focus time data efficiently.
  - Implemented a Weekly Productivity Score based on task completion, habit completion, focus time, and consistency.
  - Integrated lightweight `recharts` charts for Weekly Focus Hours and Tasks Completed.
  - Expanded `CommandPalette` with Quick Actions to access Dashboard, Analytics, Today's Tasks, and Today's Habits.
  - Integrated Dashboard query cache with Socket.IO realtime invalidation rules to reflect live updates instantly.
- **Milestone 7.1 (Study Blocks & Focus Sessions)**:
  - Added `StudyBlock` primitive for deep work focus timing.
  - Implemented `ActiveStudyWidget` as a persistent floating timer.
- **Milestone 6.2 (Real-Time Collaboration Foundation)**:
  - Added visual connection status indicator to TopBar.
- **Activity System Foundation**: Introduced an event-logging engine that tracks user actions across workspaces and projects (`Milestone 6.1`).
- Instrumented `Projects`, `Tasks`, `Notes`, `Resources`, and `Members` services to automatically record relevant lifecycle events (Creates, Updates, Deletions) and broadcast Realtime events.
- Created frontend hooks (`useWorkspaceActivity`, `useProjectActivity`) and reusable components (`ActivityList`, `ActivityItem`) for rendering activity feeds.
- Added comprehensive TypeScript literal unions for `ActivityEntityType` and `ActivityAction` to avoid complex database schema migrations.
### Added
- **Milestone 6.0 (Workspace Members & Invitations)**
  - Added backend endpoints for workspace member management (Invite, Update Role, Remove).
  - Added frontend `WorkspaceSettingsPage` to view members.
  - Added `InviteMemberDialog` for email invitations (mocked acceptance flow).
  - Expanded `CommandPalette` to search through workspace members.
  - Added roles (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`) and enforced backend authorization.

### Fixed
- Updated Prisma `WorkspaceMember` model to support pending invitations (optional `userId`, added `email` and `status`).

- Completed Milestone 5.5: Global Search & Command Palette.
  - Implemented `CommandPalette` component using `cmdk`.
  - Added global `Cmd+K` / `Ctrl+K` shortcut support.
  - Developed `useGlobalSearch` hook for filtering React Query caches.
  - Created `useRecentItems` to track navigation history.
- Completed Milestone 5.4: Project Hub Polish.
  - Refactored `project-dashboard` to a tabbed, nested routing architecture.
  - Added dedicated pages for Project Overview, Tasks, Notes, Resources, Activity, and Settings.
  - Implemented Breadcrumb navigation and Scrollable Tabs.
  - Improved data fetching efficiency using `useOutletContext`.
- Completed Milestone 5.3: Notes Foundation.
- Completed Milestone 5.2: Project Hub. Built `ProjectDashboardPage` integrating tasks and resources.
- Completed Milestone 5.1: Resources Foundation.
- Updated `taskQuerySchema` and `resourceQuerySchema` to filter by `projectId`.
### Added
- **Resource System (V1)**: Fast link pasting and preview cards inside tasks. Added backend regex detection for YouTube, GitHub, PDFs. Unified `metadata` column for future AI/embeddings.

## v0.1.3 - Milestone 3.3 Task Experience Polish
- Transformed the Task UI from a grid of cards to a high-density list layout.
- Added interactive checkboxes to task rows for one-click completion.
- Implemented inline quick task creation (Quick Add).
- Migrated the Edit Task modal to a contextual right-side Sheet.
- Added global keyboard shortcuts for power-user navigation (`c`, `/`, `j`, `k`, `Space`, `Enter`).

## v0.1.2 - Milestone 3.2 Task Experience
- Implemented `TaskList`, `TaskCard`, and `TaskFilters` frontend UI components.
- Added full URL query state syncing for Task filtering (search, status, priority).
- Created `TaskForm` and integrated it with Create and Edit Dialogs.
- Created `DeleteTaskDialog` for safe deletion.
- Aligned `@orbit/shared` type definitions (Task, Priority, Status) to accurately reflect the Prisma schema.
- Integrated UI completely with React Query hooks.

## v0.1.1 - Milestone 3.1 Task Domain Data Layer
- Added Task, Category, TaskAssignee, TaskResource, and TaskComment to Prisma schema.
- Built backend NestJS Tasks module (Controller, Service, Zod Validation Pipe).
- Created frontend API client and React Query hooks for Tasks.
- **Corrections**: Fixed API client array serialization to use `searchParams.append`.
- **Corrections**: Implemented optimistic UI updates for Task React Query mutations.
- **Corrections**: Added documentation recommending GIN/GiST `pg_trgm` index for optimized text search in PostgreSQL.

## v0.1.0 - Milestone 1 Foundation
- Initialized Turborepo with pnpm workspaces.
- Created `@orbit/web` with React 19, Vite, and Tailwind v4.
- Created `@orbit/api` with NestJS 11, Prisma, Redis.
- Created `@orbit/shared` for cross-boundary types.
- Set up Docker compose for local development.
- Defined `User`, `Workspace`, and `WorkspaceMember` models in Prisma.
