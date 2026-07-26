# Orbit Repository Audit & Inventory Report

**Generated Date**: 2026-07-24  
**Repository**: `orbit` (`Sairaj567/orbit`)  
**Workspace Root**: `c:\Users\saira\Desktop\Chats\orbit`  
**Architecture**: Monorepo (pnpm workspaces + Turborepo)  
**Primary Tech Stack**: React 19, Vite, Tailwind CSS v4, NestJS 11, Prisma ORM, PostgreSQL (with `pgvector`), Redis, Socket.IO, Clerk Auth.

---

## 1. High-Level Folder Tree

```
orbit/
├── .agents/                    # Agent skills & workspace configurations
├── .ai/                        # AI context & metadata
├── .github/                    # CI/CD workflows & templates
├── .husky/                     # Git hooks
├── apps/
│   ├── api/                    # NestJS 11 Backend Service
│   │   ├── prisma/             # Prisma Schema & Seeds
│   │   └── src/                # NestJS Application Source
│   │       ├── activity/       # Activity tracking module
│   │       ├── ai/             # AI & semantic search module
│   │       ├── common/         # Guards, decorators, filters, pipes
│   │       ├── config/         # Config loader & env validation
│   │       ├── dashboard/      # Productivity command center module
│   │       ├── habits/         # Habit management module
│   │       ├── members/        # Workspace member management module
│   │       ├── notes/          # Workspace & project notes module
│   │       ├── prisma/         # Prisma DB service module
│   │       ├── project-members/# Project membership module
│   │       ├── project-permissions/ # Project permissions & access control
│   │       ├── projects/       # Projects management module
│   │       ├── realtime/       # Socket.IO gateway & event engine
│   │       ├── redis/          # Redis connection & cache service
│   │       ├── resources/      # Link & media resource module
│   │       ├── study-blocks/   # Focus timer & study block module
│   │       └── tasks/          # Task management module
│   └── web/                    # React 19 + Vite Frontend SPA
│       ├── src/
│       │   ├── api/            # Low-level HTTP API clients
│       │   ├── app/            # App router, providers, error boundaries
│       │   ├── components/     # UI components (shadcn/ui, layout, navigation)
│       │   ├── config/         # App constants & env setup
│       │   ├── features/       # Feature-driven domain modules (hooks, components, api)
│       │   ├── hooks/          # Global React hooks & utilities
│       │   ├── lib/            # Utilities, routes, formatters
│       │   ├── pages/          # Top-level page views & nested project pages
│       │   ├── providers/      # React context & query client providers
│       │   ├── stores/         # Zustand global state stores
│       │   └── styles/         # CSS & Tailwind v4 styling
├── docs/                       # Project documentation & architectural decisions
│   ├── adr/                    # Architecture Decision Records (ADR 001 - 004)
│   └── features/               # Individual feature specs (14 Markdown files)
├── packages/
│   └── shared/                 # Shared TypeScript Package (@orbit/shared)
│       └── src/
│           ├── constants/      # Priority & status constants
│           ├── types/          # Shared DTO & domain interfaces
│           └── validators/     # Zod validation schemas
├── docker-compose.yml          # Production container setup (Postgres, Redis, API, Web)
├── docker-compose.dev.yml      # Local dev services (PostgreSQL + pgvector, Redis)
├── package.json                # Root package configuration & pnpm scripts
├── pnpm-workspace.yaml         # Monorepo workspace setup (`apps/*`, `packages/*`)
└── turbo.json                  # Turborepo task pipeline configuration
```

---

## 2. Prisma Models

The database schema (`apps/api/prisma/schema.prisma`) is modeled for PostgreSQL with `pgvector` support.

### Enums

- `TaskStatus`: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `CANCELLED`, `SKIPPED`
- `TaskPriority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `WorkspaceRole`: `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`
- `ProjectRole`: `OWNER`, `EDITOR`, `VIEWER`
- `ProjectStatus`: `PLANNING`, `ACTIVE`, `PAUSED`, `COMPLETED`
- `Visibility`: `PRIVATE`, `WORKSPACE`, `ASSIGNEES`
- `RecurrenceType`: `FIXED`, `RELATIVE`
- `ResourceType`: `WEBSITE`, `PDF`, `YOUTUBE`, `GITHUB`, `MARKDOWN`
- `StudyBlockStatus`: `RUNNING`, `COMPLETED`, `CANCELLED`
- `Role`: `OWNER`, `ADMIN`, `MEMBER`, `VIEWER`

### Database Entities

1. **`User`**: System user synced with Clerk (`clerkId`, `email`, `displayName`, `avatarUrl`, `timezone`, `preferences`, `xp`, `level`).
2. **`Workspace`**: Tenant boundary (`name`, `slug`, `description`, `avatarUrl`, `settings`, `inviteCode`).
3. **`WorkspaceMember`**: Junction model linking `User` to `Workspace` with `WorkspaceRole` (`ACTIVE` / invitation status).
4. **`Project`**: Workspace project container (`name`, `description`, `icon`, `color`, `coverImage`, `status`, `visibility`, `progress`, `order`).
5. **`ProjectMember`**: Workspace member attached to a specific `Project` with a `ProjectRole`.
6. **`Category`**: Task category tags per workspace (`name`, `color`).
7. **`Task`**: Core task entity (`title`, `description`, `status`, `priority`, `dueDate`, `estimatedDuration`, `actualDuration`, `tags`, `rrule`, `timezone`, `aiSummary`, `embedding`).
8. **`TaskAssignee`**: Many-to-many junction connecting `Task` to `User`.
9. **`TaskComment`**: Comment stream on a `Task` (`content`, `authorId`).
10. **`Habit`**: Habit tracking entity (`title`, `description`, `color`, `icon`, `rrule`, `streak`, `longestStreak`, `completionCount`).
11. **`HabitCompletion`**: Historical execution logs for `Habit` (`completedAt`).
12. **`Note`**: Rich text or markdown note linked to workspace/project/task (`title`, `content`, `isPinned`, `order`, `aiSummary`, `embedding`).
13. **`Resource`**: Saved links and media files (`title`, `url`, `type`, `metadata`, `aiSummary`, `embedding`).
14. **`Activity`**: Audit trail event log (`actorName`, `entityType`, `entityId`, `action`, `metadata`).
15. **`StudyBlock`**: Pomodoro & deep work focus session (`status`, `plannedDuration`, `actualDuration`, `startedAt`, `endedAt`, `notes`).

---

## 3. NestJS Modules

The backend (`apps/api/src/app.module.ts`) is organized into feature modules:

1. `AppModule`: Root orchestrator module.
2. `ConfigModule`: NestJS global configuration with environment validation (`env.validation.ts`).
3. `PrismaModule`: Global database access service wrapping Prisma Client.
4. `RedisModule`: Redis connection provider for caching and pub/sub.
5. `TasksModule`: Controller & service for task lifecycle management.
6. `ProjectsModule`: Controller & service for project CRUD and hub aggregation.
7. `ProjectMembersModule`: Controller & service for project-level member roles.
8. `ProjectPermissionsModule`: Fine-grained project authorization logic.
9. `ResourcesModule`: Controller & service for external web & media link resources.
10. `NotesModule`: Controller & service for workspace and project notes.
11. `MembersModule`: Controller & service for workspace member invites & roles.
12. `ActivityModule`: Controller & service for audit logging and history feeds.
13. `RealtimeModule`: Gateway service for WebSockets & Socket.IO real-time event broadcasting.
14. `HabitsModule`: Controller & service for habit tracking & streak calculations.
15. `StudyBlocksModule`: Controller & service for focus timer sessions.
16. `DashboardModule`: Controller & service aggregating workspace metrics into a unified `Productivity Score`.
17. `AiModule`: Controller & service providing text summarization and vector semantic search.

---

## 4. API Endpoints

All endpoints are scoped under NestJS controllers with strict guards (`ClerkAuthGuard`, `WorkspaceMembershipGuard`).

### System / Health

- `GET /health` — Health check endpoint
- `GET /` — Root status info

### Tasks (`/workspaces/:workspaceId/tasks`)

- `POST /` — Create a new task
- `GET /` — List tasks with pagination, filtering (status, priority, search, category, assignee)
- `GET /:id` — Get single task details
- `PATCH /:id` — Update task details
- `DELETE /:id` — Soft/hard delete task

### Projects (`/workspaces/:workspaceId/projects`)

- `POST /` — Create project
- `GET /` — List workspace projects
- `GET /:id` — Get project by ID
- `PATCH /:id` — Update project details/status/archived
- `DELETE /:id` — Delete project

### Project Members (`/workspaces/:workspaceId/projects/:projectId/members`)

- `GET /` — List project members
- `POST /` — Add workspace member to project
- `PATCH /:id` — Update member role in project
- `DELETE /:id` — Remove member from project

### Habits (`/workspaces/:workspaceId/habits`)

- `POST /` — Create habit
- `GET /` — List habits
- `GET /:id` — Get habit by ID
- `PATCH /:id` — Update habit definition
- `DELETE /:id` — Delete habit
- `POST /:id/complete` — Log habit execution and update streaks

### Study Blocks (`/workspaces/:workspaceId/study-blocks`)

- `POST /` — Start a focus session block
- `GET /active` — Get current active running focus block
- `PATCH /:id` — Update study block session details
- `POST /:id/complete` — Complete focus session
- `POST /:id/cancel` — Cancel focus session

### Notes (`/workspaces/:workspaceId/notes`)

- `POST /` — Create note
- `GET /` — List notes (by project or task)
- `GET /:id` — Get note content
- `PATCH /:id` — Update note title/content/pinned
- `DELETE /:id` — Delete note

### Resources (`/workspaces/:workspaceId/resources`)

- `POST /` — Add resource link
- `GET /` — List resources
- `GET /:id` — Get resource metadata
- `PATCH /:id` — Update resource
- `DELETE /:id` — Remove resource

### Members (`/workspaces/:workspaceId/members`)

- `GET /` — List workspace members
- `POST /` — Invite member by email
- `PATCH /:id` — Update member workspace role
- `DELETE /:id` — Remove member from workspace

### Dashboard (`/workspaces/:workspaceId/dashboard`)

- `GET /` — Fetch aggregated metrics, weekly analytics, and Productivity Score

### AI (`/workspaces/:workspaceId/ai`)

- `POST /summarize` — Generate AI summary for notes/tasks/resources
- `GET /search` — Semantic vector search across workspace resources

### Activity (`/workspaces/:workspaceId`)

- `GET /activity` — Workspace activity feed
- `GET /projects/:projectId/activity` — Project-scoped activity feed

---

## 5. React Routes

Routing is managed by `react-router` v7 in `@orbit/web` (`apps/web/src/app/router.tsx`).

| URL Route                               | Page Component          | Description                              |
| :-------------------------------------- | :---------------------- | :--------------------------------------- |
| `/`                                     | `Navigate`              | Redirects to default workspace dashboard |
| `/w/:workspaceSlug/dashboard`           | `DashboardPage`         | Productivity command center & metrics    |
| `/w/:workspaceSlug/projects`            | `ProjectsPage`          | Workspace project cards & grid           |
| `/w/:workspaceSlug/projects/:projectId` | `ProjectLayout`         | Nested project tab layout header         |
| `├─ overview`                           | `ProjectOverviewPage`   | Project summary & statistics             |
| `├─ tasks`                              | `ProjectTasksPage`      | Project-filtered task list               |
| `├─ habits`                             | `ProjectHabitsPage`     | Project-filtered habit tracker           |
| `├─ notes`                              | `ProjectNotesPage`      | Project-filtered documentation & notes   |
| `├─ resources`                          | `ProjectResourcesPage`  | Link previews & embedded references      |
| `├─ activity`                           | `ProjectActivityPage`   | Audit trail for project changes          |
| `└─ settings`                           | `ProjectSettingsPage`   | Project permissions & meta settings      |
| `/w/:workspaceSlug/tasks`               | `TasksPage`             | Full workspace task manager              |
| `/w/:workspaceSlug/tasks/:taskId`       | `TaskDetailPage`        | Contextual task sheet detail view        |
| `/w/:workspaceSlug/habits`              | `HabitsPage`            | Habit tracker & streak view              |
| `/w/:workspaceSlug/study`               | `StudyPage`             | Interactive Focus & Pomodoro Studio      |
| `/w/:workspaceSlug/notes`               | `NotesPage`             | Workspace note editor & pinned grid      |
| `/w/:workspaceSlug/calendar`            | `CalendarPage`          | Schedule & task deadline calendar        |
| `/w/:workspaceSlug/analytics`           | `AnalyticsPage`         | Velocity & productivity charts           |
| `/w/:workspaceSlug/achievements`        | `AchievementsPage`      | XP rank badges & level progress          |
| `/w/:workspaceSlug/activity`            | `ActivityPage`          | Live workspace activity feed             |
| `/w/:workspaceSlug/settings`            | `SettingsPage`          | User profile & theme settings            |
| `/w/:workspaceSlug/workspace-settings`  | `WorkspaceSettingsPage` | Workspace member invitation portal       |
| `*`                                     | `NotFoundPage`          | 404 fallback page                        |

---

## 6. Feature Pages & Modules

Frontend features (`apps/web/src/features`) are modularly partitioned:

- **`tasks`**: Task list rows, filter bars, quick-add input, `TaskDetailSheet`, status/priority badges.
- **`projects`**: Project cards, project creation modal, tabbed project navigation (`ProjectLayout`).
- **`project-members`**: Project member lists, role assignment dropdowns, member removal triggers.
- **`habits`**: Habit streak cards, daily toggle checkmarks, habit creation dialog.
- **`study-blocks`**: `ActiveStudyWidget` floating timer, Pomodoro timer studio with sound presets.
- **`notes`**: Note card grid, pinned section, search filter, markdown note editor modal.
- **`resources`**: Resource URL metadata cards, link preview icons, add resource dialog.
- **`members`**: Member list table, invitation modal, workspace role updates.
- **`dashboard`**: Productivity Score dial, weekly focus hours chart, task status breakdown, recent activity.
- **`ai`**: AI summarization trigger buttons, semantic search input component.
- **`activity`**: Activity stream feed with entity filtering & pagination.

---

## 7. Zustand Stores

Global frontend UI and client state is managed via 9 dedicated Zustand stores (`apps/web/src/stores`):

1. **`useWorkspaceStore`**: Active workspace ID, slug, and workspace switcher modal toggle.
2. **`useProjectStore`**: Active project state & filter selections.
3. **`useUIStore`**: Sidebar collapse state, modal dialog states, command palette toggle.
4. **`useThemeStore`**: Theme mode (`light`, `dark`, `system`), primary accent color selection.
5. **`useStudyBlockStore`**: Pomodoro timer state, running study block session ID, elapsed time.
6. **`useSoundStore`**: Audio volume, sound effects toggle (timer start, tick, completion chime).
7. **`usePresenceStore`**: Real-time connected user presence tracking across workspace and project rooms.
8. **`useNotificationStore`**: Toast notification queue and system alert banners.
9. **`useAccessibilityStore`**: High contrast toggle, reduced motion preference, font scale setting.

---

## 8. React Query Hooks

Data fetching, caching, and optimistic UI updates are managed via custom TanStack React Query hooks (`apps/web/src/features/*/hooks`):

- **Tasks**: `useTasks`, `useTask`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`
- **Projects**: `useProjects`, `useProject`, `useCreateProject`, `useUpdateProject`, `useDeleteProject`
- **Project Members**: `useProjectMembers`, `useInviteProjectMember`, `useUpdateProjectMemberRole`, `useRemoveProjectMember`
- **Habits**: `useHabits`, `useHabit`, `useCreateHabit`, `useUpdateHabit`, `useDeleteHabit`, `useToggleHabitComplete`
- **Study Blocks**: `useActiveStudyBlock`, `useCreateStudyBlock`, `useUpdateStudyBlock`, `useCompleteStudyBlock`, `useCancelStudyBlock`
- **Notes**: `useNotes`, `useNote`, `useCreateNote`, `useUpdateNote`, `useDeleteNote`
- **Resources**: `useResources`, `useCreateResource`, `useDeleteResource`
- **Members**: `useMembers`, `useInviteMember`, `useUpdateMemberRole`, `useRemoveMember`
- **Dashboard**: `useDashboard`
- **AI**: `useGenerateSummary`, `useSemanticSearch`
- **Activity**: `useWorkspaceActivity`, `useProjectActivity`

---

## 9. Realtime Events

Real-time collaboration is powered by NestJS WebSockets (`RealtimeGateway`) using Socket.IO authenticated via Clerk JWT tokens.

### Socket Rooms

- `workspace:{workspaceId}` — Subscribed on workspace view.
- `project:{projectId}` — Subscribed on entering a project.

### Broadcast Realtime Events (`RealtimeEvent`)

- **Task Events**: `task.created`, `task.updated`, `task.completed`, `task.deleted`
- **Note Events**: `note.created`, `note.updated`, `note.deleted`
- **Project Events**: `project.created`, `project.updated`, `project.deleted`
- **Resource Events**: `resource.created`, `resource.updated`, `resource.deleted`
- **Member Events**: `member.invited`, `member.joined`, `member.updated`, `member.removed`, `member.created`, `member.deleted`
- **Project Member Events**: `project.member.added`, `project.member.updated`, `project.member.removed`
- **Habit Events**: `habit.created`, `habit.updated`, `habit.completed`, `habit.deleted`
- **Study Block Events**: `studyBlock.created`, `studyBlock.updated`, `studyBlock.deleted`
- **Activity Events**: `activity.created`

---

## 10. Shared DTOs & Zod Schemas

Defined in `@orbit/shared` (`packages/shared/src/validators/index.ts`) for cross-boundary contract safety between frontend and backend:

### Zod Schemas

- `paginationSchema` — Query pagination (`page`, `perPage`, `sortBy`, `sortOrder`)
- `taskStatusSchema` & `taskPrioritySchema` — Enums validation
- `createTaskSchema` & `updateTaskSchema` — Task creation/mutation validation
- `taskQuerySchema` — Filtering parameters for task lists
- `createProjectSchema`, `updateProjectSchema`, `projectQuerySchema` — Project DTOs
- `createResourceSchema`, `updateResourceSchema`, `resourceQuerySchema` — Resource DTOs
- `createNoteSchema`, `updateNoteSchema`, `noteQuerySchema` — Note DTOs

### Exported TypeScript DTO Types

- `CreateTaskInput`, `UpdateTaskInput`, `TaskQueryInput`
- `CreateProjectInput`, `UpdateProjectInput`, `ProjectQueryInput`
- `CreateResourceInput`, `UpdateResourceInput`, `ResourceQueryInput`
- `CreateNoteInput`, `UpdateNoteInput`, `NoteQueryInput`
- `PaginationInput`, `DashboardResponse`, `ActivityItemResponse`

---

## 11. Documentation Files

The repository contains extensive architecture and planning documentation in `docs/`:

### Core Specifications & Guidelines

- `docs/00_PROJECT_OVERVIEW.md` — Vision & core objectives
- `docs/01_PRODUCT_SPEC.md` — Product scope & requirements
- `docs/02_ARCHITECTURE.md` — System architecture & monorepo design
- `docs/03_DESIGN_SYSTEM.md` & `docs/design_system.md` — UI tokens, colors, typography
- `docs/04_TECH_STACK.md` — Tech decisions & libraries
- `docs/05_DATABASE.md` — Entity schemas & indexing guidelines
- `docs/06_API.md` — REST & WebSocket contract specs
- `docs/07_UI_GUIDELINES.md` — UI/UX patterns & accessibility standards
- `docs/08_CONVENTIONS.md` — Code style & Git commit conventions
- `docs/09_CURRENT_STATE.md` — Milestone completion tracker
- `docs/10_NEXT_STEPS.md` — Immediate development tasks
- `docs/11_DECISIONS.md` — Architectural Decision log
- `docs/12_KNOWN_ISSUES.md` — Known bugs & limitations
- `docs/13_ROADMAP.md` — Project milestone roadmap
- `docs/14_CHANGELOG.md` — Detailed version history
- `docs/AI_HANDOFF.md` — Briefing for AI agent continuation
- `docs/PROJECT_MEMORY.md` — Strategic philosophy & non-negotiable rules
- `docs/STABILIZATION_REPORT.md` — Milestone 7.2 codebase hardening report
- `docs/architecture_review.md` & `docs/architecture_hardening.md` — Security & performance reviews

### Architectural Decision Records (`docs/adr/`)

- `ADR-001-architecture.md` — Monorepo structure selection
- `ADR-002-workspace-routing.md` — Workspace slug routing scheme
- `ADR-003-theme-system.md` — CSS variable theme architecture
- `ADR-004-state-management.md` — React Query + Zustand separation

### Feature Specifications (`docs/features/`)

- 14 feature specification documents (`tasks.md`, `projects.md`, `habits.md`, `notes.md`, `study.md`, `calendar.md`, `analytics.md`, `dashboard.md`, `achievements.md`, `activity.md`, `resources.md`, `search.md`, `settings.md`, `workspaces.md`).

---

## 12. Current Milestone Completion

- **Milestones 1 - 9**: **100% COMPLETE**
  - **Milestone 1**: Turborepo, Vite, React 19, Tailwind v4, NestJS 11, Prisma, Redis, Docker configuration.
  - **Milestones 3.1 - 3.3**: Task domain data layer, optimistic UI updates, high-density list view, quick-add input, `TaskDetailSheet`, keyboard shortcuts.
  - **Milestones 5.1 - 5.4**: Project Hub, nested routing (`ProjectLayout`), link resources system, notes module.
  - **Milestone 5.5**: Global search command palette (`Cmd+K`).
  - **Milestone 6.0**: Workspace member invitation portal & role authorization.
  - **Milestone 6.1**: Event-logging audit trail engine.
  - **Milestone 6.2**: Realtime Socket.IO gateway with Clerk authentication.
  - **Milestone 7.1**: Study blocks, focus sessions & `ActiveStudyWidget`.
  - **Milestone 7.2**: Workspace Productivity Command Center, `DashboardService`, Recharts analytics.
  - **Milestones 8.0 - 9.0**: Full platform routes (Habits, Notes, Focus Studio, Calendar, Analytics, Achievements, Activity Stream, Settings).

---

## 13. Build Status

- **Command**: `pnpm build` (`turbo build`)
- **Status**: **PASSED / SUCCESS**
- **Packages**:
  - `@orbit/shared`: Built successfully (`tsc`).
  - `@orbit/api`: Built successfully (`nest build`).
  - `@orbit/web`: Built successfully (`tsc -b && vite build`).
- **Bundle Metrics**: Vite transformed 3,424 modules and output assets cleanly into `dist/`.

---

## 14. Typecheck Status

- **Command**: `pnpm typecheck` (`turbo typecheck`)
- **Status**: **PASSED / CLEAN**
- **Errors**: `0 errors` across `@orbit/api`, `@orbit/web`, `@orbit/shared`.

---

## 15. Lint Status

- **Command**: `pnpm lint` (`turbo lint`)
- **Status**: **PASSED / CLEAN**
- **Errors**: `0 lint errors`. ESLint configuration passed clean across `@orbit/api` and `@orbit/web`.

---

## 16. Known Technical Debt

1. **Frontend Bundle Chunk Size**: `@orbit/web` build emits a chunk size warning (`dist/assets/index-BXzivjlX.js` is 1,176 kB / 343.70 kB gzipped). Introducing dynamic `import()` or Rollup `manualChunks` splitting for heavy pages (Recharts, Calendar, Study Mode) will optimize initial page load.
2. **`@orbit/shared` Lint Script**: `packages/shared/package.json` contains `echo 'No lint configured yet'` in its lint script.
3. **pgvector Embedding Integration**: Prisma schema defines vector fields (`Unsupported("vector(1536)")?`) for `Resource`, `Task`, and `Note`. AI semantic search currently uses standard database lookups pending full vector embedding ingestion pipelines.
4. **Email Invite Provider Mocking**: Member invitation endpoints in `MembersService` format pending member database rows, but email sending (Resend/SendGrid) is mocked.
5. **Realtime Socket Authorization Cache**: `RealtimeGateway` performs database queries on room joins (`join_workspace`, `join_project`). Caching user membership in Redis will improve WebSocket connection scalability under high load.

---

## 17. Git Status

- **Active Branch**: `main`
- **Tracking**: Up to date with `origin/main`
- **Working Tree**: Clean (`nothing to commit, working tree clean`)
- **Commit History**: Single root commit (`229b969 first commit`) representing the complete repository state.

---

## 18. Recent Major Architectural Changes

1. **Codebase Hardening & Stabilization (Milestone 7.2)**:
   - Standardized `@CurrentUser('id')` across all NestJS controllers to eliminate `undefined` user IDs.
   - Enforced `@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)` pipeline on all workspace-scoped backend controllers.
   - Wrapped frontend application root with `<ClerkProvider>` connected to environment variables.
   - Removed all `as any` type assertion bypasses in `DashboardService`, `MembersService`, `ProjectMembersService`, and frontend dashboard components.
2. **Project Hub Nested Routing Architecture (Milestone 5.4)**:
   - Refactored monolithic project page into nested React Router routes (`/w/:workspaceSlug/projects/:projectId/*`).
   - Created `ProjectLayout` with breadcrumb navigation and contextual tab bar (Overview, Tasks, Habits, Notes, Resources, Activity, Settings).
3. **Real-time Event Engine & WebSocket Gateway (Milestone 6.2)**:
   - Integrated Socket.IO server into NestJS with Clerk JWT token validation.
   - Wired backend lifecycle hooks to emit real-time updates (`task.*`, `note.*`, `project.*`, `habit.*`, `studyBlock.*`) for instant frontend cache invalidation.
4. **Productivity Command Center (Milestone 7.2)**:
   - Built `DashboardService` for multi-domain metric aggregation and formula-based `Productivity Score` computation.
   - Integrated `recharts` for weekly focus time and completion velocity visualization.
5. **Full Platform Page Suite (Milestones 8.0 & 9.0)**:
   - Built Habits, Notes, Study Focus Studio, Calendar Schedule, Productivity Analytics, Achievements & Leveling, Activity Stream, and Settings pages.
