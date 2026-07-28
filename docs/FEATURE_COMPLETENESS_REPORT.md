# Orbit Feature Completeness & Production Readiness Audit

**Audit date:** 2026-07-28
**Scope:** Current working tree only. API, web client, shared package, Prisma schema and migrations, tests, Docker/CI, and documentation were inspected. No application code was changed. This report is the only requested output-file change.

## Method and evidence

A feature was credited only when its route or UI is backed by a real implementation and the relevant authorization, persistence, client integration, states, and navigation were present. A model, route, controller, static page, or documentation claim by itself was not treated as completion.

Verification run on this working tree:

- `pnpm typecheck` - passed.
- `pnpm lint` - passed.
- `pnpm test` - passed: 70 API, 13 web, and 4 shared-package tests (87 total).
- Database-backed E2E tests were not run locally; the configured PostgreSQL and Redis test services were not started for this audit. CI is configured to run them.

Score guide: 9-10 is production-quality end-to-end behavior; 6-8 is real functionality with material gaps; 3-5 is partial or unreliable; 0-2 is absent or only presentation/scaffolding.

## Executive assessment

Orbit is a genuine NestJS/Prisma/React product foundation, not a mock repository. It has authenticated API plumbing, shared contracts, persisted core domains, React Query clients, role checks, activity records, Socket.IO rooms, CI, and a deployable single-VM Docker composition. It is **not production ready** because central workflows and data boundaries remain incomplete.

The most consequential verified blockers are:

1. `ProjectsPage` and `ProjectLayout` read a nonexistent `workspaceId` router parameter even though the route exposes `workspaceSlug`; both fall back to `home`. Project listing, project routes, and all Project Hub tabs are therefore non-operational for normal workspace URLs.
2. `ProtectedLayout` is a fragment rather than an access guard. A signed-out user can render the application shell and only encounters authorization failures from requests.
3. Socket lifecycle and cache synchronization are not dependable. The provider recreates the socket after its own `socket` state changes; task update/delete events are never emitted; habits are never subscribed; and several invalidation prefixes do not match their actual query keys.
4. Dashboard aggregation and AI semantic search are only workspace-scoped. They do not consistently apply project-membership access and can expose project data to a workspace member without project access.
5. Project settings and project activity are visible shells, task deep-link detail is a shell, analytics presents fabricated chart points, and Achievements/Notifications have no current product surface or backend.

## Feature audit

### Authentication - Functional but Missing Polish

**Overview.** Clerk JWT verification, local-user provisioning, signed Clerk webhooks, soft deletion, and a development bypass are implemented. The client lacks actual route protection UX.

**Backend - 7/10.** `ClerkAuthGuard` verifies bearer tokens, rejects soft-deleted users, and provisions a local user on first request. Signed Svix webhook handling supports Clerk lifecycle events, and user profile DTO validation is shared. The guard, provisioning, and webhook service have tests. `AUTH_MODE=dev_bypass` provisions a fixed local identity and the server rejects that mode in production. There is no documented webhook retry/dead-letter/reconciliation process.

**Frontend - 4/10.** ClerkProvider is conditionally configured and the app can intentionally run in local dev-bypass mode. Profile settings are real. `ProtectedLayout` renders children without loading, sign-in, redirect, or forbidden handling. The top-bar identity is static rather than sourced from the signed-in user/profile.

**Integration - 6/10.** Feature clients obtain tokens through the auth abstraction and use `/api/v1`. Workspace server guards resolve both database IDs and slugs. The frontend does not prevent unauthenticated navigation before requests fail.

**Verified missing functionality:** real protected-route/sign-in/denied UX; dynamic shell identity; operational webhook retry/reconciliation documentation.

### Workspaces - Partial

**Overview.** A user can load active workspaces, switch by slug, and an owner/admin can update metadata. The API can create a workspace, but the product cannot create one.

**Backend - 6/10.** Create/list/update operations use shared Zod schemas, persist owner membership atomically, exclude soft-deleted workspaces, and enforce active membership/role checks. No archive/delete/restore or invite-code join lifecycle is exposed. Workspace changes do not record activity or broadcast a workspace event.

**Frontend - 5/10.** The switcher and settings form use real data with loading, error, empty, read-only, responsive, and mutation-success behavior. There is no create, archive, delete, restore, or join flow.

**Integration - 7/10.** The stored workspace ID/slug and slug-based navigation are compatible with the server guard. A slug update navigates to the changed URL. There is no workspace realtime flow and metadata cache handling is limited to the local mutation path.

**Verified missing functionality:** UI creation; archive/delete/restore; invite-code join lifecycle; workspace activity and realtime.

### Members - Functional but Missing Polish

**Overview.** Workspace membership list, invitation-record creation, role changes, removal, activity records, and Socket.IO broadcasts exist.

**Backend - 6/10.** Class-validator DTOs, owner/admin mutation checks, owner/self-removal protections, persistence, activity records, broadcasts, and socket eviction are present. An existing user is made active immediately; an unknown email only creates a pending row. There is no email delivery, acceptance, expiry, revocation, or automatic linking when that person later creates a Clerk account.

**Frontend - 6/10.** Roster, invite dialog, role-aware controls, loading/empty states, and responsive rows are implemented. Browser confirmation is used for removal. There is no pending-invitation management, resend/revoke flow, server-side member search, or dedicated destructive/error presentation.

**Integration - 6/10.** React Query clients consume the envelope and member events invalidate the `['members']` prefix used by the hooks. Command Palette member search is limited to already-cached members.

**Verified missing functionality:** invitation delivery/acceptance/expiry/revocation; pending-invitation lifecycle; server search; dedicated destructive-action/error UX.

### Projects - Partial

**Overview.** Project CRUD and a multi-tab Project Hub are implemented in source, but main project navigation is broken by the route-parameter mismatch.

**Backend - 6/10.** Create/list/read/update/archive operations use shared inputs, Prisma persistence, creator-as-owner membership, project-role checks, activity logging, and broadcasts. `findAll` requires a `ProjectMember` even for `WORKSPACE` visibility, so workspace-visible semantics are not implemented. Lists do not explicitly filter soft-deleted projects. Update/delete activity is attributed to the creator rather than the requester.

**Frontend - 3/10.** Cards, nested tabs, scoped overview/tasks/habits/notes/resources pages, responsive tabs, and some states are real. There is no project-create UI. Settings inputs are enabled but Save, Archive, and Delete are permanently disabled. Project activity is a static empty state. `workspaceId` is read from route params instead of `workspaceSlug`, so listing, lookup, API calls, and links use `home`.

**Integration - 3/10.** Clients and server slug resolution are compatible in isolation, but the wrong parameter prevents actual use. Project-created broadcasts target only the new project room, which no user can normally have joined before it exists; invalidation does not cover every project query key.

**Verified missing functionality:** working route parameter integration; create UI; usable settings/archive/delete UI; rendered project activity; `WORKSPACE` visibility semantics; deleted-project filtering; accurate activity actor attribution.

### Project Permissions - Partial

**Overview.** Project viewer/editor/owner authorization and project-member CRUD are centralized, but boundary validation and usable UI are incomplete.

**Backend - 6/10.** Permission checks confirm active workspace membership, correct workspace ownership, and role rank. Project-member list/invite/change/remove enforce final-owner and self-leave rules. Controller bodies are inline TypeScript shapes rather than DTOs, so member IDs/roles are not validated at the boundary. Inviting does not verify that the target workspace-member row belongs to the routed workspace. Changes broadcast and evict sockets, but create/update/remove do not create activity records.

**Frontend - 4/10.** A member list and invite dialog exist in Project Settings, which is itself inaccessible through the broken Project Hub. Controls are not consistently hidden/disabled for viewers and feedback/error states are sparse.

**Integration - 3/10.** Query/mutation hooks are real but depend on the broken workspace value. `useRealtimeSync` neither subscribes to nor invalidates project-member event keys.

**Verified missing functionality:** validated DTOs; target workspace-member ownership verification; activity records; role-aware UI; realtime cache handling; working Project Hub route.

### Tasks - Functional but Missing Polish

**Overview.** This is the strongest domain: CRUD, pagination, filters, assignees, recurrence fields, quick add, list/detail-sheet UI, keyboard workflow, resources, and AI-summary trigger exist.

**Backend - 7/10.** Shared Zod DTOs, persistence, pagination, text/status/priority/category/project/tag/assignee filters, project/workspace permissions, assignee rows, activity, and creation broadcasts are present. Marking a recurring task done clones a next occurrence. `TaskComment` is schema-only: there is no controller, service, DTO, or UI. Assignee IDs are not verified as active workspace/project users. Recurrence completion returns from its transaction before activity, embeddings, and broadcast logic; normal update/delete do not broadcast their declared Socket.IO events. Category has no CRUD. Completion has no dedicated timestamp.

**Frontend - 7/10.** List, loading/empty states, filters, create/delete dialogs, quick add, recurrence selector, assignee picker, responsive controls, sheet, URL resource paste, AI card, and keyboard shortcuts are present. The sheet receives a list item rather than fetching the detailed endpoint, so its returned comments/resources/summary are not dependable. `/tasks/:taskId` is explicitly a static shell. Mutation errors are not visibly surfaced and the UI exposes fewer filters than the API.

**Integration - 6/10.** API envelope handling, React Query lists, and optimistic mutations are real. The socket listener expects update/delete events that services do not emit. Palette project-task links point to a route that does not exist; the normal detail link reaches a shell.

**Verified missing functionality:** comments; working deep-link detail; assignee membership validation; category management; full filter UI; recurrence side effects; task update/delete broadcasts; mutation error UX; valid project-task links.

### Habits - Partial

**Overview.** Project-scoped habits offer create/edit/delete, same-day completion toggling, persisted counters/streak fields, activity, broadcasts, and simple cards.

**Backend - 6/10.** Shared schemas, project-editor authorization, completions, counters, streak fields, activity, and broadcasts exist. RRule/timezone fields are stored and partially considered for streaks, but completion is allowed on any day regardless of recurrence. Day boundaries use server time rather than the habit timezone. Uncompletion decrements rather than recomputes historical streaks. Archived habits are not excluded or given a dedicated view.

**Frontend - 5/10.** Create/edit dialogs, cards, loading/empty states, and responsive summary cards exist. The global page silently assigns a new habit to the first returned project; it has no project chooser, recurrence editor, history/statistics screen, or visible mutation error state.

**Integration - 6/10.** Hooks and invalidations use real APIs. The service emits `habit.*`, but `useRealtimeSync` has no habit subscriptions. The Project Hub defect also prevents project-scoped management from working.

**Verified missing functionality:** recurrence configuration/due enforcement; timezone-correct completion; historical streak recomputation; archive handling; project selector; history/statistics; error UX; habit realtime refresh.

### Study Blocks - Functional but Missing Polish

**Overview.** A user can run one active personal study block per workspace with a timer, project selection, completion/cancellation, completion notes, activity on start/complete, and a floating active widget.

**Backend - 6/10.** Create/active/update/complete/cancel endpoints use Zod schemas and persistence. Blocks are creator-private; creation checks project-viewer access; start/complete record activity and broadcast. Cancel/update have no activity record. There is no history endpoint, automatic completion at planned duration, or validation that task/habit references belong to the selected workspace/project.

**Frontend - 6/10.** Presets, selected project, timer, start/complete/cancel, disabled loading controls, responsive layout, and completion notes are implemented. A timer reaching zero does not complete the session. Pause, history, task/habit selection, active-note save, sound/notification, explanatory no-project state, and mutation errors are absent.

**Integration - 5/10.** Active-session hooks use the real stored workspace ID and response envelope. Study broadcasts exist, but query invalidation does not precisely match active-session keys and may be sent only to project rooms. Dashboard refresh is incomplete.

**Verified missing functionality:** auto-completion/notification; history; pause and active-note persistence UI; task/habit ownership validation/pickers; cancel/update activity; reliable realtime/dashboard refresh; complete error/empty UX.

### Notes - Functional but Missing Polish

**Overview.** Notes provide CRUD, Markdown edit/preview, pinning, project/task fields, local text search, activity, broadcasts, and embedding requests.

**Backend - 6/10.** Controllers, shared validation, persistence, permissions, pinning, activity, broadcasts, and embeddings exist. The current model and creation validator require a project, so notes are not workspace-wide despite service branches for unassigned notes. There is no server text search, author, version/history, collaboration, or check that `taskId` belongs to the selected project/workspace. Moving a note broadcasts only to the original project room.

**Frontend - 6/10.** Create/edit/delete dialogs, Markdown editing/preview, pins, responsive cards, local title/content search, loading, and empty states are real. Global creation silently uses the first project and offers no project/task picker or visible mutation error. Cards are clickable `div`s rather than keyboard-operable controls.

**Integration - 5/10.** React Query calls/mutations are implemented. Socket invalidation uses `['notes']`, while feature hooks use `['workspaces', workspaceId, 'notes']`; remote changes do not refresh those views.

**Verified missing functionality:** server search; project/task selectors; task ownership validation; author/history; correct moved-note broadcast; matching realtime invalidation; accessible cards; mutation error UX.

### Resources - Partial

**Overview.** URL resources can be created, type-inferred, attached to tasks/projects, shown, opened, and deleted.

**Backend - 5/10.** CRUD, shared validation, URL type inference, persistence, permissions, activity, broadcasts, and embedding requests exist. Metadata is caller-supplied: no fetcher, preview renderer, OpenGraph extraction, title enrichment, or cache exists. Create/update do not verify that `taskId` belongs to the selected workspace/project. Resource lists do not separately validate task-scoped access.

**Frontend - 4/10.** Fast URL paste/Enter add, task/project displays, loading/empty state on the project page, and deletion are implemented. There is no global library, update UI, filters, metadata editor, preview, error UI, or delete confirmation. `new URL(resource.url)` is called while rendering a card and can throw for malformed persisted URLs.

**Integration - 5/10.** React Query list/create/delete and envelope use are real; resource invalidation prefix matches the hooks. Update is available in the client but has no hook/UI. No OpenGraph/preview integration exists.

**Verified missing functionality:** metadata/OpenGraph/preview pipeline; task/project ownership validation; update/filter/library UI; safe URL rendering; confirmation/error UX.

### Dashboard - Partial

**Overview.** A backend aggregate feeds score cards, task/habit sections, recent projects, recent activity, quick actions, and responsive chart containers.

**Backend - 5/10.** The service calculates personal assigned due/overdue tasks, study time, habits, projects, activity, and a score. Habits/recent projects lack direct project-membership filtering. Completed-task count uses `updatedAt`, so a later edit can make a historical task appear completed today. The score uses fixed baselines and no auditable historical period; no series is returned for charts.

**Frontend - 7/10.** Loading/error, responsive cards, empty states, quick access, activity presentation, and task/habit cards are real. Command Palette holds quick actions. Recharts containers are responsive, but the chart component explicitly fabricates weekly distribution points from current aggregates.

**Integration - 5/10.** Dashboard API, token, envelope, and slug resolution work. Some events invalidate the dashboard, but task updates/deletes are never emitted, habits are not subscribed, study invalidation is incomplete, and project links lead to the broken Project Hub.

**Verified missing functionality:** project-membership-safe aggregation; historical chart data; dedicated task-completion time; reliable realtime invalidation; working project destinations.

### Activity Feed - Partial

**Overview.** Workspace/project activity APIs, a paginated workspace feed, and reusable activity components exist.

**Backend - 6/10.** Multiple domains write activities; workspace/project reads are cursor-paginated. Workspace reads filter private-project events by project membership. Activity writes are fire-and-forget and swallow errors, so audit completeness cannot be guaranteed. Study cancel/update and project-member mutations are not logged.

**Frontend - 5/10.** The workspace page offers loading, empty, refresh, and load-more. Project Activity is a static empty-state shell and never calls the available project hook. It has no action filter.

**Integration - 4/10.** Workspace activity handling is correct. Realtime invalidates `['activities']`, but hooks are keyed under `['workspaces', workspaceId, 'activity']`; live updates do not refresh the feed.

**Verified missing functionality:** guaranteed audit writes; activity coverage for omitted mutations; rendered project feed; matching realtime invalidation; action filters.

### Calendar - Partial

**Overview.** The page is a client-side month grid with a selected-day task agenda, not the specified unified calendar.

**Backend - 0/10.** No calendar controller, service, range query, or aggregation endpoint exists.

**Frontend - 4/10.** Month navigation, task counts by due date, selected-day agenda, loading skeleton, and empty agenda are implemented. It loads the default task list only; it does not load a date range, habits, study blocks, or events. Agenda items do not open detail and there is no request-error state.

**Integration - 3/10.** It consumes `useTasks`, but there is no calendar-specific React Query/API contract or realtime invalidation.

**Verified missing functionality:** calendar API; date-range loading; habits/study/events; detail navigation; error state; realtime refresh.

### Analytics - Scaffold Only

**Overview.** Analytics is a display layer over dashboard data, not a separate analytics implementation.

**Backend - 1/10.** No analytics module, endpoint, model, aggregation, historical query, cohort, or export exists.

**Frontend - 3/10.** The page has skeletons and consumes dashboard data, but supplies hard-coded fallback KPIs. `DashboardCharts` explicitly creates mock weekly points. Its formula labels conflict with the backend: it states Focus 40% / Habits 20%, while the service calculates Focus 20% / Habits 30%.

**Integration - 2/10.** It reuses `useDashboard`; it has no dedicated API, query key, historical data model, or realtime model.

**Verified missing functionality:** analytics backend; real historical data; accurate no-data behavior; formula consistency; date ranges, drilldowns, and export.

### Achievements - Missing Pieces

**Overview.** There is no current Achievements route, page, navigation item, store, API, or feature module. The former unbacked presentation UI was removed.

**Backend - 0/10.** `User.xp` and `User.level` remain inert schema fields. There is no achievement/badge persistence, rules engine, event consumer, API, background processing, or XP award logic.

**Frontend - 0/10.** No page, route, navigation entry, data view, loading/error/empty state, or accessible interaction exists.

**Integration - 0/10.** No API, React Query, Zustand, Socket.IO, command palette, or dashboard linkage exists.

**Verified missing functionality:** the entire feature: data model, rules, XP updates, APIs, UI, realtime behavior, and tests.

### AI - Partial

**Overview.** OpenAI summarization, embeddings, pgvector storage, and semantic-search code exist; the user workflow and data isolation are incomplete.

**Backend - 4/10.** `AiService` calls chat completions for summaries and `text-embedding-3-small` for embeddings. Tasks, notes, and resources request embeddings after changes; semantic search unions all three pgvector tables. The API checks workspace membership only. Raw semantic SQL neither filters project membership nor excludes deleted tasks, so it can return inaccessible/deleted project content. Search limit is parsed but not range-validated. Embedding errors are swallowed; absent provider config yields an internal error rather than a feature-disabled response.

**Frontend - 4/10.** Task-sheet summary generation and semantic results in the Command Palette are real. There is no standalone search UI, entity-specific navigation for notes/resources, persisted summary write-back, reindexing control, or AI-disabled experience.

**Integration - 4/10.** Authenticated API clients and React Query hooks exist. Palette result paths are generic and task deep links are shells. There is no queue, retry state, reindexing, index monitoring, or permission-aware result contract.

**Verified missing functionality:** project-permission/deleted-row filtering; entity deep links; persisted summaries; disabled-provider UX; reindex/retry/observability; validated limits.

### Search - Partial

**Overview.** Cmd/Ctrl+K Command Palette, local recent items, cached client search, quick navigation actions, and optional semantic results are implemented. There is no actual global text search.

**Backend - 1/10.** No textual global-search endpoint exists. Semantic search is a separate API and has the access-control gap described above.

**Frontend - 5/10.** The accessible `cmdk` palette supports keyboard trigger, recent items in localStorage, quick actions, cached projects/tasks/habits/notes/resources/members, semantic loading, and an empty state. It can only search already-loaded cache data. Project-task paths are invalid; note/resource results lead to broad collection pages rather than a focused entity.

**Integration - 4/10.** Most cache keys are read correctly and semantic search is called. Unloaded records cannot be discovered, and Project Hub routing prevents useful project results.

**Verified missing functionality:** server global text search; secure semantic search; entity deep links; cache-independent results; working Project Hub paths.

### Notifications - Missing Pieces

**Overview.** The former unbacked bell, overlay, and Zustand store were removed. User preferences retain a `notificationsEnabled` field, but no notification feature exists.

**Backend - 0/10.** No schema, service, delivery, preferences API, endpoint, or socket notification event exists.

**Frontend - 0/10.** No bell, panel, route, settings controls, states, or accessible notification interaction exists.

**Integration - 0/10.** No API, React Query, store, socket, or activity-to-notification integration exists.

**Verified missing functionality:** notification center, persistence, preferences workflow, realtime delivery, email/push/browser channels, and tests.

### Settings - Functional but Missing Polish

**Overview.** User profile/timezone/theme plus workspace metadata and member settings are implemented through real APIs.

**Backend - 6/10.** `/users/me` GET/PATCH and workspace PATCH are authenticated, validated, and tested. Workspace update requires owner/admin. There is no billing, account deletion UX/API, password/security management, notification preferences API, or standalone workspace-settings JSON API.

**Frontend - 6/10.** Profile load/save/error, theme selection, a timezone selector, metadata form, and member management are present. Timezone choices are a short fixed list; shell identity is static; workspace settings require an existing workspace and cannot start creation.

**Integration - 7/10.** User/workspace mutations use actual API calls, shared validation, and response handling; theme is Zustand-backed. No profile realtime or Clerk-profile reconciliation beyond local data exists.

**Verified missing functionality:** complete timezone choices; notification/account/security/billing settings; dynamic identity; workspace creation entry point.

## Cross-cutting systems

| System          | Score | Verified state                                                                                                                                                                                                                                                               |
| --------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React Query     |  6/10 | Established domain hooks, pagination, and some optimistic mutations. Realtime invalidation keys mismatch activity/note/study queries; no central API-error mapping.                                                                                                          |
| Zustand         |  5/10 | Appropriate UI/theme/workspace/session-like use. URL and store workspace state can drift; presence is unconnected. The old notification store was removed.                                                                                                                   |
| Socket.IO       |  4/10 | Authenticated workspace/project rooms and eviction are implemented/tested. Provider lifecycle is unstable; emission/subscription coverage is incomplete; cache keys mismatch. Mid-session JWT expiry is accepted and sockets are single-instance only.                       |
| Prisma/database |  6/10 | Core models, pgvector extension, indexes, migrations, and soft deletion exist. Cross-entity link validation/constraints are incomplete; `Project.creatorId` has no User relation; several lifecycle models are absent.                                                       |
| Shared package  |  7/10 | Shared types, validators, constants, response envelope, and tests exist. Project-member bodies are inline/unshared and some domain semantics are absent from contracts.                                                                                                      |
| Docker          |  7/10 | Production compose orchestrates PostgreSQL, Redis, API, and web; API/web images have health checks; API entrypoint deploys migrations. It is a single-VM/single-instance design, host ports expose internal services, and production secret/backup operations remain manual. |
| CI/CD           |  6/10 | CI uses locked installs, build/lint/typecheck/format checks, pgvector/Redis, migrations, unit/E2E tests, and container builds. There is no deployment, artifact publishing, environment promotion, security/dependency scan, or automated rollback.                          |
| Documentation   |  3/10 | Current State/Roadmap acknowledge the audit, but many feature specifications and legacy handoff/audit files still make contradicted implementation claims.                                                                                                                   |

## Documentation accuracy

### Current State and Roadmap

`09_CURRENT_STATE.md` and `13_ROADMAP.md` now broadly agree with the source: they identify the Project Hub parameter defect, missing route protection, incomplete realtime, dashboard/AI permission gaps, mock analytics, and removed Achievements/Notifications. They should be treated as summaries, not proof of implementation.

### Changelog discrepancies

`14_CHANGELOG.md` opens with a correction saying its older completion claims are superseded by this audit. That correction matches the source. The legacy entries below remain internally contradictory and should not be left as apparent release facts:

1. It calls Habits, Notes, Study, Calendar, Analytics, and Achievements "complete" even though the source has the gaps recorded above; Achievements is now removed entirely.
2. It describes Analytics charts as productivity metrics, but the chart component fabricates weekly points and no analytics backend exists.
3. It describes Project Hub polish as completed, but the route-parameter defect prevents it working and Project Activity/Settings actions are shells.
4. It says activity is broadcast/live; broadcast exists, but React Query invalidation does not match the activity query key.

### Feature-spec and legacy-document discrepancies

1. `features/achievements.md` says a static achievements route exists. Source and its regression test show that route, navigation, and fake UI were removed.
2. `features/activity.md` says activity WebSockets are both implemented in its status line and deferred in its body. Activity broadcasts are implemented; client live refresh is broken. Its declared activity unions omit implemented Habit/Study Block and uncompletion usage.
3. `features/dashboard.md` promises automatic relevant-event refresh. Task update/delete events are not emitted, habits are not subscribed, study refresh is incomplete, and the charts are mock data.
4. `features/habits.md` documents obsolete model, endpoint, and component names and leaves its implementation checklist unchecked although a partial implementation exists.
5. `features/notes.md` has a correct current-status callout but a contradictory later "Completed" claim; it declares `authorId`, which the Prisma Note model does not have.
6. `features/projects.md` correctly flags the route defect, but describes Settings as configuration/deletion although its actions are disabled and does not state project creation is absent.
7. `features/resources.md` says resources appear only on Tasks; a project resource page exists. It correctly states that OpenGraph scraping is absent.
8. `features/search.md` says Habits are future search work and command executions are absent; source searches cached habits and implements quick navigation actions. It correctly states search is client-cache-only.
9. `features/settings.md` has an accurate status callout but unchecked checkboxes for forms, RBAC UI, and API wiring that source implements.
10. `features/study.md` describes a shared synchronized timer, participant model, and timer socket API that do not exist. The status callout correctly describes a personal partial implementation.
11. `features/tasks.md` has a correct status callout but a conflicting "complete" claim and says recurrence is absent. Recurrence fields/UI/clone logic exist; comments, real deep links, full filters, and update/delete realtime are missing. It also names a `TaskResource` model that is not in the Prisma schema.
12. `features/workspaces.md` describes invitations at a high level but omits the verified absence of delivery, acceptance, expiry, revocation, and pending-user linking.
13. `00_PROJECT_OVERVIEW.md`, `AI_HANDOFF.md`, `implementation_plan.md`, and `REPOSITORY_AUDIT.md` are historical/forward-looking documents that still describe Milestone 1-only state, removed notification/achievement files, or completed full platform routes. They do not match the current tree.

`01_PRODUCT_SPEC.md` is a product target, not a claim of implemented behavior; its listed calendar, gamification, and realtime capabilities remain planned rather than verified delivered functionality.

## Technical debt

### 🔴 Critical

- Project list and all Project Hub tabs use an undefined `workspaceId` parameter and fall back to `home`.
- `ProtectedLayout` does not enforce authentication or provide signed-out/unauthorized handling.
- Semantic search does not enforce project membership or exclude soft-deleted tasks.
- Realtime provider depends on its own `socket` state in its connection-creation effect, causing disconnect/recreation.

### 🟠 High

- Task update/delete events are not emitted; habit events are not subscribed; activity/note/study invalidation keys do not match their hooks.
- Dashboard exposes habits/recent projects without project-membership filtering.
- `WORKSPACE` project visibility is not implemented; project lists require membership.
- Analytics presents mock/fallback values as metrics.
- Pending invitations have no delivery, acceptance, expiry, revoke, or user-linking path.
- No multi-instance Socket.IO adapter, observability service, deployment pipeline, or automated release rollback exists.

### 🟡 Medium

- Comments/category management are absent despite task schema support for comments.
- Notes/resources/study blocks do not comprehensively validate linked-entity ownership.
- Habit recurrence/timezone handling and streak rollback are not correct for history.
- Dashboard uses `Task.updatedAt` as completion time.
- Resource cards can throw for malformed stored URLs.
- Project-member mutation bodies lack DTO validation/activity records.
- Activity logging swallows failures.
- Project settings/activity and task deep-link detail are visible shells.

### 🟢 Low

- Static shell identity and limited timezone list reduce polish.
- Production compose exposes database/Redis host ports; local development has an insecure pgAdmin default credential.
- Legacy documents contain stale claims and some encoding artifacts.
- Web test coverage is narrow for the route/feature surface.

## Overall scores

| Area                             |              Score |
| -------------------------------- | -----------------: |
| Architecture                     |               6/10 |
| Backend                          |               6/10 |
| Frontend                         |               5/10 |
| Database                         |               6/10 |
| Realtime                         |               4/10 |
| AI                               |               4/10 |
| Performance                      |               4/10 |
| UX                               |               5/10 |
| Accessibility                    |               5/10 |
| Maintainability                  |               5/10 |
| Scalability                      |               4/10 |
| Documentation                    |               3/10 |
| Testing                          |               6/10 |
| Deployment Readiness             |               5/10 |
| **Overall Production Readiness** | **4/10 - Partial** |

## Final summary

### Actually complete features

- Shared validation/response-envelope foundation.
- Clerk token verification, JIT provisioning, signed webhook lifecycle, and production-safe dev-bypass guardrail.
- Workspace listing/metadata updates and user profile/theme/timezone updates.
- Basic workspace-member CRUD with server-side role checks.
- Non-deep-link task CRUD/list/filter workflow.
- Single-VM container build/run path with migration entrypoint and health checks.

### Partially complete features

- Workspaces, Members, Projects, Project Permissions, Tasks, Habits, Study Blocks, Notes, Resources, Dashboard, Activity Feed, Calendar, AI, Search, and Settings.
- React Query, Zustand, Socket.IO, Prisma, Docker, and CI.

### Placeholder features

- Task deep-link detail route.
- Project Activity tab.
- Project Settings save/archive/delete actions.
- Analytics as a data product (the page exists but its metrics are not real analytics).

### Features that need polish

- Member invitation lifecycle and role-aware UI.
- Task comments/categories, detailed deep links, full filters, recurrence side effects, and mutation errors.
- Habit recurrence/timezone/history/statistics.
- Study auto-completion/history/pause and error/empty states.
- Note/resource selectors, metadata/previews, safe links, and accessible presentation.
- Dynamic identity, broad timezone selection, and access-state UX.

### Features that should be built next

1. Repair Project Hub `workspaceSlug` integration, then complete project creation/settings/activity.
2. Stabilize Socket.IO lifecycle, emit/consume declared events, and align cache keys.
3. Close project-scope authorization in dashboard and AI search.
4. Complete task comments/deep links and the workspace-invitation lifecycle.
5. Replace analytics mock data with permission-safe historical backend aggregation.

### Features that should not be built yet

- Achievements/gamification expansion.
- Notification delivery channels.
- Additional AI surfaces or embeddings UX.
- Calendar integrations and advanced analytics.

Those should wait until routing, authentication UX, authorization boundaries, and realtime consistency are repaired.
