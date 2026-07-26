# Orbit Feature Completeness & Production Readiness Audit

**Audit date:** 2026-07-26
**Scope:** Current working tree only: API, web client, shared package, Prisma schema/migrations, Docker, CI, tests, and product documentation. No application code was modified. This file is the requested audit output.

## Assessment method and rubric

This report treats an implementation as complete only where the endpoint, persistence, authorization, UI, and client integration are all present and mutually compatible. A page, controller, schema field, or documentation claim alone is not evidence of completion.

Scores are deliberately strict:

- **9–10:** verified end-to-end feature with production-quality state, access, and operational handling.
- **6–8:** real end-to-end functionality, but material workflow or hardening gaps remain.
- **3–5:** substantial pieces exist, but a key path is incomplete, unreliable, or placeholder-backed.
- **0–2:** static shell, isolated scaffolding, or missing implementation.

### Verified checks

- `pnpm typecheck` — passed (Turbo cache replayed).
- `pnpm lint` — passed (Turbo cache replayed).
- `pnpm test` — passed: 70 API, 4 shared, and 9 web tests.
- The database-dependent E2E suite was not run locally; it needs the configured PostgreSQL/Redis test services. CI is configured to run it.

## Executive assessment

Orbit has a real Nest/Prisma/React application with functioning domain services, shared validation, authentication plumbing, workspace resolution by ID **or slug**, and meaningful automated tests. It is not production ready.

The largest verified blockers are:

1. The Projects route and every nested Project Hub route read a nonexistent `workspaceId` route parameter and therefore call APIs and build links with the fallback value `home`, rather than the router's `workspaceSlug`.
2. The client has no actual route guard: `ProtectedLayout` renders children unconditionally. Clerk is configured, but signed-out navigation reaches the application shell and relies on individual requests failing.
3. Realtime is not dependable end-to-end. `RealtimeProvider` recreates its socket whenever its own `socket` state changes; task updates/deletes are never broadcast; habits have no client subscription; and several invalidation keys do not match their queries.
4. Project membership is not applied to dashboard data or AI semantic-search results. A workspace member can receive data from projects to which they are not a project member.
5. Analytics contains fabricated fallback KPIs and charts explicitly derived from mock weekly distribution data. Achievements are a hard-coded static page.

## Feature audit

### Authentication — **Functional but Missing Polish**

**Overview.** Clerk JWT verification, local user storage, just-in-time user provisioning, signed webhook handling, and a `/users/me` profile API are implemented.

**Backend — 7/10.** `ClerkAuthGuard` verifies a bearer token and attaches a local user. Missing local users are provisioned through Clerk; a signed Svix webhook handles user create/update/delete, and deletion includes ownership/task cleanup. The `User` model supports soft deletion and profile preferences, and profile updates use shared Zod validation. The guard and provisioning service have tests. The webhook requires correct external secret configuration and there is no documented operational retry/dead-letter strategy.

**Frontend — 4/10.** ClerkProvider, profile settings, and the API token flow are present. `ProtectedLayout` is only a fragment, so it does not render loading, sign-in, unauthorized, or redirect behavior. The top-bar user name and email remain hard-coded (`Saira Khan`, `saira@orbit.app`) rather than using Clerk or the profile API. There is no application-owned sign-in/sign-up or access-denied experience.

**Integration — 6/10.** Feature clients generally obtain Clerk tokens and use the normalized `/api/v1` path. User profile and update hooks use the API envelope correctly. The workspace guard now resolves both slug and database ID, fixing the historical slug-only concern. The UI does not gate access before API requests fail.

**Production Readiness:** **Functional but Missing Polish**.

**Verified missing functionality:** route protection/sign-in state UX; dynamic shell identity; operational webhook retry/reconciliation documentation.

### Workspaces — **Partial**

**Overview.** Users can list their active workspaces and owners/admins can edit workspace metadata. Backend creation exists, but the product lacks a workspace creation flow.

**Backend — 6/10.** `WorkspacesController` exposes create/list/update; shared Zod schemas validate name, slug, description, and avatar URL. Creation atomically creates the owner membership; list excludes deleted workspaces and returns the member role. `WorkspaceMembershipGuard` resolves IDs or slugs and enforces active membership. There is no delete/archive/restore endpoint, invite-code join flow, workspace activity log, or workspace realtime event.

**Frontend — 5/10.** The shell loads workspaces through React Query and has real loading, error, and zero-workspace states. The switcher is driven by API data, and workspace details include client validation, mutation feedback, read-only behavior, and responsive layout. No UI creates a first workspace, archives one, joins one, or manages invite codes.

**Integration — 7/10.** Workspace data uses the shared response envelope and stores the real ID plus slug. Navigation is slug-based, which the API guard supports. Updating a slug navigates to the new URL. The workspace cache is not updated/revalidated after metadata mutation beyond the individual mutation path, and no realtime handling exists.

**Production Readiness:** **Partial**.

**Verified missing functionality:** UI workspace creation; archive/delete/restore; invite-code/join lifecycle; workspace activity and realtime.

### Members — **Functional but Missing Polish**

**Overview.** Workspace member list, invite record creation, role change, removal, activity records, and socket broadcasts exist.

**Backend — 6/10.** Member DTOs use class-validator. Owner/admin-only mutation routes, owner protection, self-removal protection, persistence, activity logging, socket broadcasts, and socket eviction are implemented. Inviting an existing user makes them active immediately; inviting an unknown email only creates a pending record. There is no delivery, acceptance, expiry, revocation, or eventual linking of that pending invite after a matching Clerk user appears.

**Frontend — 6/10.** Member roster and invite dialog are implemented with loading, empty, role-aware controls, and responsive presentation. Workspace settings determines the user's role from the loaded membership list. Deletion uses browser confirmation and there is no dedicated pending-invitation management or invitation resend/revoke experience.

**Integration — 6/10.** React Query clients consume the envelope and workspace slugs resolve at the API. Member realtime invalidation uses the `['members']` prefix and can refresh member queries. Command-palette member search only searches cached data.

**Production Readiness:** **Functional but Missing Polish**.

**Verified missing functionality:** invitation delivery/acceptance/expiry/revocation; pending invitation lifecycle; server-side member search; dedicated destructive-action/error UX.

### Projects — **Partial**

**Overview.** Project CRUD, project membership records, and a multi-tab Project Hub are present in source, but the main project navigation is currently broken.

**Backend — 6/10.** CRUD has shared Zod validation, Prisma persistence, creator-as-owner membership creation, project-role enforcement, activity logging, and broadcasts. `findAll` only returns projects having a `ProjectMember` record; the `WORKSPACE` visibility enum is therefore not implemented as workspace-wide visibility. Lists do not explicitly exclude soft-deleted projects. Delete is an archive/soft-delete operation. Update/delete activity attributes the action to `creatorId`, not the requester.

**Frontend — 3/10.** The project cards, responsive nested tabs, scoped overview/tasks/habits/notes/resources pages, and several loading/empty states are implemented. There is no project creation interface. Project settings is a visibly scaffolded form: inputs are enabled but save/archive/delete controls are permanently disabled. Project activity is a static empty-state shell. Crucially, `ProjectsPage` and `ProjectLayout` destructure `workspaceId` from router params, but the route defines `:workspaceSlug`; both fall back to `home`. This breaks listing, project lookup, child API calls, and child links for normal workspace URLs.

**Integration — 3/10.** API envelopes and workspace-slug resolution work. The incorrect route parameter prevents the UI from using that integration. Project-created broadcasts target only the new project's room; a user cannot normally be in that room before project creation. Realtime invalidation does not cover every project query key.

**Production Readiness:** **Partial**.

**Verified missing functionality:** working route-param integration; create project UI; usable settings/archive/delete UI; rendered project activity feed; `WORKSPACE` visibility semantics; deleted-project filtering; accurate activity actor attribution.

### Project Permissions — **Partial**

**Overview.** Project viewer/editor/owner checks are centralized and Project Member CRUD exists.

**Backend — 6/10.** `ProjectPermissionsService` confirms active workspace membership, project workspace ownership, and rank. Project-member list/invite/update/remove endpoints use it; the final-owner rule and self-leave logic are present. Controller bodies are inline TypeScript objects, not validation DTOs, so role values and member IDs are not validated at the boundary. Invitation does not verify that the target workspace-member record belongs to the route's workspace before creating the project membership. Project-member changes have socket events and eviction, but no activity records.

**Frontend — 4/10.** A list and invite dialog exist in project settings. The settings page itself is unreachable through the broken Project Hub path. Controls are not consistently hidden/disabled for project viewers and mutation feedback/error states are limited.

**Integration — 3/10.** Query and mutation hooks are real but depend on the broken Project Hub workspace value. `useRealtimeSync` does not subscribe to or invalidate project-member event keys.

**Production Readiness:** **Partial**.

**Verified missing functionality:** boundary DTO validation; target workspace-member ownership check; activity records; role-aware UI; realtime cache handling; working Project Hub routing.

### Tasks — **Functional but Missing Polish**

**Overview.** Tasks are the strongest domain: CRUD, pagination, filters, assignees, recurrence fields, quick add, list UI, detail sheet, keyboard navigation, resources, and AI summary trigger exist.

**Backend — 7/10.** Controllers, shared Zod DTOs, Prisma data model, pagination, text/status/priority/category/project/tag/assignee filtering, project/workspace permissions, assignee persistence, activity records, and create broadcasts exist. Completing a recurring task clones an occurrence. Comments are schema-only: there is no comment service, controller, DTO, or UI. Assignee IDs are not verified as active workspace/project members. The recurring completion transaction returns before activity, embeddings, and broadcasts; normal update/delete also do not broadcast `task.updated`/`task.deleted`. There is no category CRUD. Task completion timestamps are inferred from `updatedAt` elsewhere rather than stored.

**Frontend — 7/10.** Dense list, loading/empty states, filters, create/delete dialogs, quick add, recurrence selector, assignee picker, responsive controls, task sheet, resource paste, AI summary card, and documented keyboard shortcuts are implemented. The detail sheet receives the list item, not a detail query, so comments/resources/AI summary returned by `findOne` are not reliably populated. The deep-link `/tasks/:taskId` is explicitly a placeholder. Forms have no surfaced mutation failure state and the filter UI exposes only search/status/priority despite broader backend filters.

**Integration — 6/10.** React Query clients use the correct envelope and optimistic list mutations. Workspace slugs are accepted by the API. The realtime listener expects task update/delete events that services do not emit. Command Palette generates a nonexistent project task deep link (`/projects/:projectId/tasks/:taskId`) and normal task detail is only a shell.

**Production Readiness:** **Functional but Missing Polish**.

**Verified missing functionality:** comments; usable deep-link detail; assignee membership validation; category management; complete filter UI; recurrence activity/embedding/realtime; task update/delete broadcasts; mutation feedback; valid project-task command links.

### Habits — **Partial**

**Overview.** Project-scoped habits support create/edit/delete, same-day completion toggle, persisted counters, streak fields, and basic dashboard/stat cards.

**Backend — 6/10.** CRUD uses shared Zod schemas and project-editor authorization. Completion records, streak/count fields, activity logs, and broadcasts are present. RRule/timezone fields are persisted and partially used in streak calculation, but a habit may be completed on any day regardless of recurrence. Dates use server-local day boundaries, not the habit timezone. Un-completing decrements current streak rather than recomputing the historical sequence. Archived habits are neither excluded nor separately exposed.

**Frontend — 5/10.** Create/edit dialogs, completion cards, loading, empty presentation, responsive summary cards, and project-scoped creation exist. The global page silently assigns a new habit to the first returned project; it has no project picker, history/statistics view, recurrence configuration, or error state. Dashboard cards are not a full habit management experience.

**Integration — 6/10.** Hooks and envelope use are sound and mutations invalidate habit queries. Realtime emits `habit.*`, but the global listener has no habit subscriptions, so remote habit changes do not refresh the screen. Project route failure also blocks the project-scoped UI.

**Production Readiness:** **Partial**.

**Verified missing functionality:** recurrence configuration/due enforcement; timezone-aware completion; historical streak recomputation; archive behavior; project selector; completion history/statistics; mutation/error UX; habit realtime invalidation.

### Study Blocks — **Functional but Missing Polish**

**Overview.** Users can run one personal active study block per workspace with timer display, completion, cancellation, project linkage, notes on completion, activity on start/complete, and a floating active-session widget.

**Backend — 6/10.** Create/active/update/complete/cancel endpoints use Zod schemas and persist study blocks. Blocks are restricted to their creator; create requires project viewer access; and start/complete events record activity and broadcasts. Cancel and update have no activity record. There is no history endpoint, no automatic completion at planned duration, and no validation that optional task/habit links belong to the selected workspace/project.

**Frontend — 6/10.** Presets, selected project, timer, start/complete/cancel controls, loading disablement, responsive layout, and completion notes are implemented. The count-down stops at zero without completing the session. No pause, history, task/habit picker, active-note save, sound/notification, no-project explanation, or mutation failure UI exists.

**Integration — 5/10.** Active session hooks use the real stored workspace ID and API envelope. Broadcasts exist, but the sync hook's `['study-blocks']` invalidation is too broad/incomplete relative to the active key and events can be project-room-only. The dashboard is not invalidated after every relevant study action.

**Production Readiness:** **Functional but Missing Polish**.

**Verified missing functionality:** auto-completion/notification; history; pause and active-note persistence UI; task/habit ownership validation and pickers; cancel/update activity; reliable realtime/dashboard cache refresh; error/empty UX.

### Notes — **Functional but Missing Polish**

**Overview.** Notes provide CRUD, Markdown edit/preview, pinning, project and task fields, local text search, activity, broadcasts, and embedding requests.

**Backend — 6/10.** Controllers, Zod validation, persistence, permission checks, pinning, activity, broadcasts, and embedding calls are implemented. The schema and create validator require a project, so notes are not workspace-wide despite service branches for unassigned notes. There is no server text search, authorship, version/history, collaboration, or validation that `taskId` belongs to the specified project/workspace. Moving a note broadcasts only to the original project's room.

**Frontend — 6/10.** Create/edit/delete dialogs, Markdown edit/preview, pins, responsive cards, local title/content search, loading and empty states are present. Global note creation silently uses the first returned project and has no project/task selector or error state. Cards are clickable `div`s rather than keyboard-operable controls.

**Integration — 5/10.** React Query consumes raw enveloped note arrays and mutations invalidate queries. The global listener invalidates `['notes']`, whereas note hooks use `['workspaces', workspaceId, 'notes']`; remote note changes therefore do not refresh those queries.

**Production Readiness:** **Functional but Missing Polish**.

**Verified missing functionality:** server search; project/task selection; task ownership validation; author/version/history; correct moved-note broadcast; matching realtime invalidation; accessible cards; mutation/error feedback.

### Resources — **Partial**

**Overview.** URL resources can be created, type-inferred, attached to a task/project, displayed, opened, and deleted.

**Backend — 5/10.** CRUD, Zod validation, URL type inference, persistence, permissions, activity, broadcasts, and embedding requests exist. Metadata is caller-supplied; no URL fetch, preview rendering, OpenGraph extraction, title enrichment, or cache pipeline exists. Create/update do not verify that `taskId` belongs to the selected workspace/project. Resource rows have no owner/creator. Resource lists can expose task-filtered resources without validating access to that task separately.

**Frontend — 4/10.** Fast URL paste/Enter add, project and task displays, loading/empty state on project view, and delete action are implemented. There is no global resource library, update UI, filters, metadata editor, preview, create/delete error display, or delete confirmation. `ResourceCard` calls `new URL(resource.url)` during render, which can crash the component for any persisted malformed value.

**Integration — 5/10.** React Query list/create/delete and API envelopes are implemented. The global resource cache prefix matches feature keys. No OpenGraph or preview integration exists, and update is exposed by the API client but has no hook/UI.

**Production Readiness:** **Partial**.

**Verified missing functionality:** server metadata/OpenGraph/preview pipeline; task/project ownership validation; update/filter/library UI; safe malformed URL rendering; confirmation/error UX.

### Dashboard — **Partial**

**Overview.** The dashboard uses a real backend aggregation endpoint and presents score cards, task/habit sections, recent projects, activity, quick actions, and charts.

**Backend — 5/10.** The service aggregates personal assigned due/overdue tasks, study time, habits, recent projects, activity, and a score. It has no direct project-membership filtering for habits or recent projects, so it can return data from projects the requester cannot access. It counts completed tasks using `updatedAt`, so later edits to historical completed tasks can count as completed today. The score uses arbitrary fixed baselines rather than an auditable period model. No historical chart series is produced.

**Frontend — 7/10.** Dashboard loading, error, responsive cards, empty states, quick access, activity presentation, and task/habit cards are real. Quick actions live in Command Palette. Chart containers use Recharts responsively. The chart data is explicitly fabricated from the current aggregate values rather than returned history.

**Integration — 5/10.** Dashboard client uses the correct API prefix, token, and response envelope; slugs resolve at the server. Some realtime events invalidate `['dashboard']`, but task updates/deletes are not emitted, habits are not subscribed, and study refresh is incomplete. Dashboard project links lead into the broken Project Hub.

**Production Readiness:** **Partial**.

**Verified missing functionality:** project-membership-safe aggregation; actual historical chart data; accurate task-completion time; reliable realtime invalidation; working project destinations.

### Activity Feed — **Partial**

**Overview.** Workspace and project activity endpoints exist, with an infinite workspace feed UI and a reusable activity list.

**Backend — 6/10.** Activities are persisted by many domains and workspace/project reads are paginated by cursor. The workspace query filters private project events by project membership. Activity writes are fire-and-forget and silently swallow errors, so audit completeness is not guaranteed. Several important actions are not logged (for example study cancel/update and project membership changes).

**Frontend — 5/10.** Workspace activity page has loading, empty, refresh, and load-more behavior. The Project Activity tab is a static empty state and never calls the existing project activity hook. There are no filters in the page despite change-log claims.

**Integration — 4/10.** Workspace activity hook consumes the envelope correctly. `useRealtimeSync` invalidates `['activities']`, but activity queries are keyed under `['workspaces', workspaceId, 'activity']`; live activity updates do not refresh them.

**Production Readiness:** **Partial**.

**Verified missing functionality:** reliable audit writes; activity coverage for omitted mutations; rendered project feed; working realtime invalidation; implemented action filters.

### Calendar — **Partial implementation**

**Overview.** A responsive month grid and selected-day task agenda exist. It is not the documented unified calendar feature.

**Backend — 0/10.** There is no calendar controller, service, range query, or aggregator endpoint.

**Frontend — 4/10.** The page renders month navigation, task counts by due date, selected-day agenda, loading skeleton, and empty agenda. It only loads the default task list, not a date-range query, habits, study blocks, or workspace events. It does not navigate to task details and has no request-error state.

**Integration — 3/10.** It uses React Query through `useTasks`, but there is no calendar-specific integration or realtime invalidation.

**Production Readiness:** **Partial**.

**Verified missing functionality:** calendar API; date-range loading; habits/study blocks/events; detail navigation; error state; realtime refresh.

### Analytics — **Scaffold Only**

**Overview.** Analytics is a display layer over dashboard data, not an analytics implementation.

**Backend — 1/10.** There is no analytics module, endpoint, data model, aggregation, historical query, cohort, or export.

**Frontend — 3/10.** The page calls dashboard data and has loading skeletons, but supplies hard-coded fallback scores when no data is returned. `DashboardCharts` explicitly constructs `mockWeeklyData`, so the displayed weekly trend is not actual recorded history. Formula labels also conflict with the implemented dashboard formula: the page says Focus 40% / Habits 20%, while the backend uses Focus 20% / Habits 30%.

**Integration — 2/10.** It reuses `useDashboard`; it has no dedicated React Query/API integration or realtime model.

**Production Readiness:** **Scaffold Only**.

**Verified missing functionality:** analytics backend; real historical data; accurate no-data behavior; formula consistency; date ranges, drilldowns, and export.

### Achievements — **Scaffold Only**

**Overview.** The achievements route is a static mockup.

**Backend — 0/10.** `User` has `xp` and `level` fields, but no achievement/badge model, rules engine, activity consumer, API, background processing, or XP-award implementation exists.

**Frontend — 2/10.** The page is responsive and visually complete, but its level, XP, dates, achievements, lock state, and progress are hard-coded constants. It has no loading, error, empty, or mutation state because it has no data source.

**Integration — 0/10.** No API, React Query, Zustand, socket, navigation action, or dashboard linkage exists beyond the static route.

**Production Readiness:** **Scaffold Only**.

**Verified missing functionality:** every data-bearing part of achievements: persistence, rules, XP updates, APIs, live UI, and tests.

### AI — **Partial**

**Overview.** OpenAI summary, embedding generation, pgvector storage, and semantic search code are present; the end-user workflow is limited and permission filtering is incomplete.

**Backend — 4/10.** `AiService` invokes chat completions for summaries and `text-embedding-3-small` for embeddings. Tasks, notes, and resources request embeddings after create/update; `semanticSearch` queries pgvector across all three tables. AI endpoints are guarded by workspace membership, but semantic search does not filter project membership or deleted tasks, so a workspace member can receive indexed content from inaccessible/deleted project records. Search limits are parsed but not range-validated. Embedding errors are swallowed; missing provider configuration fails an AI request rather than producing a feature-disabled response.

**Frontend — 4/10.** The task sheet exposes summary generation and Command Palette issues semantic queries after three characters with a loading indicator. There is no standalone search experience, no result detail navigation for notes/resources, no persisted summary write-back, and task detail links lead to a placeholder route.

**Integration — 4/10.** Authenticated client and React Query hooks exist. Palette results use generic routes rather than entity-specific deep links. There is no queue, retry status, reindexing tool, index migration/monitoring, or permission-aware result contract.

**Production Readiness:** **Partial**.

**Verified missing functionality:** project-permission/deleted-row filtering; entity deep links; persisted summaries; AI-disabled UX; reindex/retry/observability; validated search limits.

### Search — **Partial**

**Overview.** Cmd/Ctrl+K Command Palette and client-side cache search are implemented; global server search is not.

**Backend — 1/10.** There is no textual global-search endpoint. AI semantic search is separate and has the authorization gap described above.

**Frontend — 5/10.** The palette is keyboard-triggered, accessible through `cmdk`, has recent items in localStorage, quick navigation actions, client-side search for cached projects/tasks/habits/notes/resources/members, semantic-result loading, and an empty state. It only searches data previously loaded into React Query. It creates invalid project-task paths; note/resource results navigate to broad collection pages rather than items.

**Integration — 4/10.** It reads cache keys correctly for most list hooks and calls semantic search. It cannot discover unloaded records, and the broken Project Hub prevents project results from being useful.

**Production Readiness:** **Partial**.

**Verified missing functionality:** server global text search; secure semantic search; reliable entity deep links; cache-independent results; fixed Project Hub paths.

### Notifications — **Scaffold Only**

**Overview.** A bell component and an in-memory Zustand store exist.

**Backend — 0/10.** No notification schema, service, delivery, preferences, endpoints, or realtime notification events exist.

**Frontend — 1/10.** The bell can receive a count/callback, but no panel is wired. The Zustand items are initialized empty and no source populates them.

**Integration — 0/10.** No API or socket integration.

**Production Readiness:** **Scaffold Only**.

**Verified missing functionality:** notification system end-to-end.

### Settings — **Functional but Missing Polish**

**Overview.** User profile/timezone/theme and workspace metadata/member settings are implemented separately.

**Backend — 6/10.** `/users/me` GET/PATCH and workspace PATCH are authenticated, validated, and tested. Workspace update is owner/admin constrained. There is no billing, notification preferences, account deletion UI/API, password/security management, or workspace settings JSON API.

**Frontend — 6/10.** Profile loading/save/error state, theme choice, timezone selector, workspace metadata form, and member management exist. Timezone is a short fixed list, not an exhaustive selector. The shell identity is static. Workspace settings are only reachable after a workspace has already been created elsewhere.

**Integration — 7/10.** Profile and workspace mutations use real API calls, shared validation, and correct response handling. Theme uses Zustand. No user/profile realtime or Clerk profile synchronization beyond local database storage.

**Production Readiness:** **Functional but Missing Polish**.

**Verified missing functionality:** complete timezone choices; notification/account/security/billing settings; dynamic shell identity; workspace creation entry point.

## Cross-cutting systems

| System          | Score | Verified state                                                                                                                                                                                                                                                                 |
| --------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| React Query     |  6/10 | Well-established domain hooks, pagination and several optimistic mutations. Query-key inconsistencies prevent activity/note/study realtime refresh; no centralized API error mapping.                                                                                          |
| Zustand         |  5/10 | Used appropriately for UI/theme/workspace/session-like state. Notification and presence stores are unconnected; duplicated URL/store workspace state can drift.                                                                                                                |
| Socket.IO       |  4/10 | Authenticated rooms and eviction are implemented/tested. Provider reconnect lifecycle is unstable, event emission/subscription coverage is incomplete, and cache keys mismatch.                                                                                                |
| Prisma/database |  6/10 | Sensible core schema, pgvector extension, activity indexes, migrations, and soft deletion for user/workspace/task/project. Missing constraints/validations for cross-entity task/resource/note links; several lifecycle tables/features absent.                                |
| Shared package  |  7/10 | Shared types, validators, constants, response envelope, and tests exist. Project-members use inline unshared input types; several domain semantics are not represented in shared contracts.                                                                                    |
| Docker          |  5/10 | Database/Redis compose and API/web Dockerfiles exist. Compose does not orchestrate API/web services, production secrets/deployment configuration is not supplied, and no health checks exist for application containers.                                                       |
| CI/CD           |  6/10 | CI installs locked dependencies, builds, lint/typechecks/formats, starts pgvector/Redis, migrates, and runs unit/E2E tests. No deployment pipeline, environment promotion, artifact/image publishing, security/dependency scanning, or migration rollback strategy is present. |
| Documentation   |  2/10 | Broad coverage exists but the current state, roadmap, change log, and feature docs conflict materially with the source.                                                                                                                                                        |

## Documentation accuracy discrepancies

The following are direct source-to-documentation discrepancies, not roadmap opinions.

1. `09_CURRENT_STATE.md` says all platform routes are “complete and operational,” but Projects/Project Hub have the verified `workspaceId`/`workspaceSlug` routing defect; project settings/activity are scaffolded; analytics/achievements are not operational data features; and ProtectedLayout does not protect routes.
2. `09_CURRENT_STATE.md` simultaneously lists habits, notes, and study as completed and lists Habit, Note, and StudyBlock schema/API/frontend work as “Not Started.” The schema and modules currently exist.
3. `13_ROADMAP.md` says Project Domain is the “Next Major Hub,” Habits/Notes are future feature work, real-time is future, and gamification/analytics are future. Source includes all of those partial implementations. It also duplicates “Milestone 5.”
4. `14_CHANGELOG.md` calls the platform completion complete and describes an “integrated live” activity feed, “complete” analytics, and completed achievements. Project activity is static; analytics contains hard-coded fallback and mock chart data; achievements are static; activity realtime invalidation does not match the query key.
5. `docs/features/tasks.md` says the task frontend is complete and its known limitation is no recurrence. Recurrence fields/UI/clone logic now exist, while comments, deep-link detail, complete filter UI, and update/delete realtime are missing.
6. `docs/features/notes.md` calls Notes completed and declares an `authorId` field. The Prisma `Note` model has no author field; server search, history, ownership validation, and robust realtime behavior are absent.
7. `docs/features/resources.md` says resources currently only appear on Tasks. They also appear in project pages. Its “no deep OpenGraph scraping” limitation is accurate.
8. `docs/features/activity.md` says WebSockets are deferred. Activity broadcast exists, but its frontend invalidation is broken. The documented `Activity` unions omit implemented HABIT/STUDY_BLOCK and UNCOMPLETED action usage.
9. `docs/features/calendar.md`, `habits.md`, `study.md`, and `achievements.md` say Not Started, although calendar/habits/study have partial source implementations and achievements has a static presentation route. Their listed models/endpoints/components do not match the actual shapes.
10. `docs/features/analytics.md` presents weekly charts as data-backed. `dashboard-charts.tsx` explicitly builds mock weekly data. It also does not acknowledge that Analytics lacks an API/module.
11. `docs/features/search.md` says V1 covers projects/tasks/notes/resources and not command executions. Source additionally searches cached habits/members and implements navigation quick actions; it does not provide actual server search.
12. `docs/features/settings.md` says the workspace API is `/api/workspaces/:workspaceId` and invites use `/invites`. Actual endpoints are `/api/v1/workspaces/:workspaceId` and `/members`; user profile and workspace metadata forms are already wired, contradicting the unchecked implementation checklist.
13. `docs/features/projects.md` correctly marks project activity as planned and settings as a next step, conflicting with `CURRENT_STATE`/`CHANGELOG` completion claims. It does not document the current route-param failure.

## Technical debt

### 🔴 Critical

- Project listing and every Project Hub tab use an undefined `workspaceId` route parameter and fall back to `home`.
- `ProtectedLayout` does not enforce authentication or provide unauthenticated state handling.
- Semantic search is restricted only by workspace membership, not project membership, and does not exclude soft-deleted tasks.
- Realtime provider depends on `socket` in the socket-creation effect; changing socket state causes disconnect/recreation rather than a stable connection.

### 🟠 High

- Task update/delete events are not emitted; habit events are not subscribed; and activity/note/study invalidation keys do not match their queries.
- Dashboard returns habits/recent projects without project-membership filtering.
- Project `WORKSPACE` visibility semantics are not implemented; lists require a ProjectMember record.
- Analytics presents mock/fallback values as metrics; achievements presents hard-coded user progress as product state.
- Pending workspace invitations have no delivery, accept, expiry, revoke, or user-linking flow.
- No operationally complete production deployment path exists (app orchestration, secret management, artifact deployment, rollback).

### 🟡 Medium

- Task comments and category management are schema-only/absent.
- Notes/resources/study blocks do not fully validate linked entity ownership.
- Habit recurrence/date handling is not timezone-correct and streak rollback is not historically recomputed.
- Dashboard counts completion using `Task.updatedAt`; task completion has no dedicated timestamp.
- Resource cards can throw on malformed persisted URLs.
- Project-member mutations use unvalidated inline bodies and lack activity logging.
- Activity logging intentionally swallows failures, leaving audit completeness unverifiable.
- Project settings and project activity are visible scaffolds rather than completed flows.

### 🟢 Low

- Static top-bar user identity and a small fixed timezone list reduce polish.
- `docker-compose.dev.yml` uses an insecure default pgAdmin credential suitable only for local development.
- Several docs have stale status, duplicated milestones, and encoding artifacts.
- Web test coverage is narrow relative to the route and feature surface.

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
| Documentation                    |               2/10 |
| Testing                          |               6/10 |
| Deployment Readiness             |               4/10 |
| **Overall Production Readiness** | **4/10 — Partial** |

## Final summary

### Actually complete features

- Shared request validation/response envelope foundation.
- Clerk token verification, JIT provisioning, and signed webhook user lifecycle handling.
- Workspace list and metadata update flow.
- User profile/timezone update flow.
- Basic workspace member CRUD with server-side role enforcement.
- Core task CRUD/list/filter flow for the non-deep-link workspace task view.

### Partially complete features

- Projects and project permissions.
- Tasks: recurrence, assignees, resources, and keyboard workflow exist, but comments/detail/realtime are incomplete.
- Habits, Notes, Resources, Study Blocks, Dashboard, Activity Feed, Calendar, AI, Search, and Settings.
- React Query, Zustand, Socket.IO, Prisma, Docker, CI.

### Placeholder features

- Achievements.
- Notifications.
- Analytics as a data product (the UI exists, but backend and charts are not real analytics).
- Task deep-link detail route.
- Project Activity tab and project settings save/archive/delete controls.

### Features that need polish after blockers are resolved

- Member invitation lifecycle and role-aware UI.
- Task comments/categories, detail page, full filters, recurrence UX, and mutation feedback.
- Habit recurrence/timezone/stats/history.
- Study auto-completion/history/pause and better empty/error states.
- Note/resource editing, preview/metadata, safe links, and entity selectors.
- Full timezone selection, dynamic identity, notifications, and accessibility refinements.

### Features that should be built next

1. Repair Project Hub route parameter use and finish project settings/activity; this restores an existing central product flow.
2. Stabilize realtime lifecycle, emit/consume the declared domain events, and align cache keys.
3. Close permission/data-scope gaps in dashboard and AI search.
4. Complete task comments/deep links and invitation lifecycle.
5. Replace mock analytics with permission-safe historical backend data.

### Features that should not be built yet

- Gamification/achievements expansion.
- Push/email notifications.
- Additional AI features or embeddings UX.
- Calendar integrations and advanced analytics.

Those features should wait until route correctness, authorization boundaries, realtime consistency, and current documentation are addressed.
