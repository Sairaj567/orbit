# Orbit Feature Completeness & Production Readiness Audit

**Audit date:** 2026-07-24  
**Scope:** source, Prisma schema/migrations, Docker/CI, and product documentation. No runtime server or database was changed. `pnpm lint` and `pnpm typecheck` passed from Turbo cache; there are no automated test files and the CI test job is commented out.

## Executive assessment

Orbit has a substantial codebase and several real domain services, but it is **not production-ready**. The primary blocker is a verified client/server contract and tenant-identity failure:

- The web shell treats static workspace **slugs** (`home`, `studio-sprint`, `research-lab`) as API `workspaceId` values. The API guards and queries require database workspace IDs. The included seed instead creates `workspace_demo_orbit` with slug `orbit-demo`.
- The global API interceptor wraps every successful response in `{ data, errors }`, while multiple clients consume unwrapped data. Projects also return `{ items, meta }`, while the client/pages require `{ data, meta }`. This breaks normal rendering and mutation assumptions rather than merely types.
- The Dashboard and AI clients call paths inconsistent with the API prefix and omit the required bearer token. The AI paths contain `/api/...` rather than `/api/v1/...`; Dashboard omits `/api/v1`; neither adds Clerk authorization.

Consequently, route presence and existing components cannot be considered working product functionality.

### Scoring rubric

- **9–10:** verified complete flow with production-quality handling.
- **6–8:** substantial implementation, with specific material omissions.
- **3–5:** partial implementation or a non-working integration path.
- **0–2:** shell, static presentation, or absent implementation.

## Feature audit

### Authentication — **Partial**

**Overview.** Clerk token verification exists on the API and a Clerk provider exists in the web app.

**Backend — 5/10.** `ClerkAuthGuard` verifies bearer tokens and resolves a local user; `WorkspaceMembershipGuard` checks membership and role metadata. Validation and exception infrastructure are present. However, there is no user-provisioning/synchronization endpoint or webhook: an authenticated Clerk user absent from `User` is always rejected. The frontend protected layout is a fragment and does not gate unauthenticated routes. Workspace membership is correctly required for protected feature routes, but the static slug/ID mismatch prevents the guard from finding the intended membership.

**Frontend — 3/10.** Clerk is configured, and error/loading shells exist. There are no sign-in/sign-up experiences or route protection, and user identity in the shell is hard-coded (`Saira Khan`, `saira@orbit.app`).

**Integration — 2/10.** Most feature clients acquire a token, but dashboard and AI do not. No sync connects Clerk users/workspaces to the application database. Shared user types exist; no account state is hydrated from the API.

**Production Readiness:** **Partial**.

**Missing pieces.** User/workspace synchronization; real protected-route behavior; real current-user display; consistent authenticated API client; a workspace identity mapping rather than static slugs.

### Workspaces — **Scaffold Only**

**Overview.** The database models a workspace and memberships, but the product does not implement workspace lifecycle or selection from server data.

**Backend — 2/10.** `Workspace` and `WorkspaceMember` schema models exist and membership is checked. There is no workspaces module, controller, DTOs, CRUD, workspace lookup by slug, activity logging for workspace changes, or workspace realtime events.

**Frontend — 2/10.** Workspace switching, roles, counts, statuses, and navigation are sourced from a hard-coded `WORKSPACES` array. It contains three demo entries that do not match the seed. The selector is responsive/accessibly labelled but cannot manage actual workspaces.

**Integration — 0/10.** No React Query workspace API exists. `WorkspaceLayout` stores `nextWorkspace.slug` as `currentWorkspaceId`; every dashboard/study and most feature request then sends a slug where the API expects a database ID. Sidebar links also derive a workspace from `activePath.split('/')[2]`; since `activePath` is already stripped (for example `/tasks`), the result falls back to `home`.

**Production Readiness:** **Scaffold Only**.

**Missing pieces.** Workspace APIs and server-derived workspace context; create/update/archive/invite-code flows; slug-to-ID resolution; membership-aware navigation; activity/realtime; removal of static workspace identity/data.

### Members — **Functional but Missing Polish**

**Overview.** Workspace member listing, pending records, role changes, and removal have backend and UI code.

**Backend — 6/10.** Endpoints are guarded and role-limited to owner/admin for mutations; class-validator DTOs validate email and role. Database support, activity records, and member realtime broadcasts are present. A new email only creates a pending row—no email delivery, acceptance, expiry, or Clerk provisioning is implemented. The `VIEWER` role is not enforced as read-only for general workspace-level feature mutations.

**Frontend — 5/10.** Member list has loading, empty, and error states; invitation and role controls are present. It uses browser `confirm()` for deletion and does not surface mutation error/success state. Role UI is conditional, but navigation hides neither restricted pages nor actions using live permissions.

**Integration — 3/10.** React Query hooks and realtime invalidation are present, but they send the static workspace slug. The command palette can only search member data already cached. Pending invitations have no completion flow.

**Production Readiness:** **Functional but Missing Polish**.

**Missing pieces.** Deliver/accept/revoke invitations; live workspace identity; all-feature viewer enforcement; mutation feedback; role-aware navigation; server search beyond cache.

### Projects — **Partial**

**Overview.** API CRUD and a nested project hub exist, including overview, task, note, habit, resource, activity, and settings tabs.

**Backend — 6/10.** Controller, Zod DTOs, Prisma data model, project owner membership creation, project-level role checks, activity logging, and broadcasts exist. Project listing only returns projects with a `ProjectMember` row, including `WORKSPACE`-visibility projects, so visibility is not implemented as a workspace-wide access model. Archive/delete semantics are conflated: `DELETE` only archives/soft-deletes. List queries do not exclude `deletedAt` projects. Updates and delete activity/realtime report `creatorId` rather than the acting user.

**Frontend — 4/10.** Nested responsive tabs and scoped data screens are real. Loading and empty states exist in several tabs. There is no project creation UI, and the Settings page renders enabled inputs with all save/archive/delete buttons permanently disabled. Project Activity is a static empty-state shell despite a working project activity endpoint. Project loading uses the wrong route param name (`workspaceId`, while router exposes `workspaceSlug`) and relies on the broken API response shape.

**Integration — 2/10.** Query hooks and optimistic mutations exist, but `ProjectsClient.findAll` expects `{ data }` while the service returns `{ items, meta }` inside the global `{ data, errors }` envelope. Pages therefore cannot obtain `data?.data`. Realtime broadcasts are emitted to a project room only; users see a project-created event only if already joined that project, and the sync listener invalidates keys that do not match all feature keys.

**Production Readiness:** **Partial**.

**Missing pieces.** Working list/detail response contract; project create/manage UI; persistence of project settings; real activity tab; correct visibility model; exclude archived/deleted records; reliable actor attribution and workspace-wide project events.

### Project Permissions — **Partial**

**Overview.** Project-level memberships and owner/editor/viewer checks are implemented in a dedicated service.

**Backend — 6/10.** `ProjectPermissionsService` checks an active workspace membership, project ownership of the workspace, and minimum role. Project-member endpoints implement list/add/change/remove with the service checks. Their bodies are inline TypeScript types rather than validated DTOs, so roles/member IDs are not validated at the controller boundary. There is no activity logging or realtime broadcast for project membership changes. A project owner can grant additional owners; there is no ownership-transfer policy.

**Frontend — 4/10.** Project-member list, invite dialog, and controls exist with a loading state. Controls are shown to any project viewer; the API rejects unauthorized actions rather than the UI reflecting permissions. No error/empty state is provided for a failed member query. It supports no confirmation or mutation feedback.

**Integration — 3/10.** Query/mutation hooks exist, but use the broken workspace identity. No project-member realtime invalidation exists, even though shared events declare project-member event names.

**Production Readiness:** **Partial**.

**Missing pieces.** Validated project-member DTOs; role-aware controls; project member activity and realtime; error feedback; membership/ownership transfer rules; working workspace identity.

### Tasks — **Functional but Missing Polish**

**Overview.** This is the most complete domain: CRUD, assignees, a dense list, filters, quick add, keyboard navigation, a detail sheet, resources, and basic recurrence code exist.

**Backend — 7/10.** Controller, Zod schemas, pagination/filtering, project permissions, task/assignee persistence, recurrence cloning, activity records, and creation broadcasts exist. Text/tag/status/priority/category/assignee filters are implemented. Comments are schema-only: no comment controller/service/DTO/UI. Recurrence is only generated when a task is transitioned to done; the transaction return bypasses activity logging, embedding, and realtime broadcast. Normal update/delete do not broadcast `task.updated`/`task.deleted`, despite the shared event contract and frontend listener. Assignee IDs are not verified as active workspace/project members before creation. Task CRUD may remain allowed for workspace `VIEWER` if a task has no project.

**Frontend — 6/10.** Task list loading and empty states, responsive filter controls, create/delete dialogs, quick add, completion, and documented keyboard shortcuts are implemented. The form exposes daily/weekly/monthly relative recurrence and a multiselect assignee UI. It has no comments, no board/subtask UI, no category selector, no duration UI, and no expanded filter UI for tags/category/assignee/project. The detail sheet receives the list row rather than a `useTask` detail query, so server-provided resources and AI summary are not reliably present. The deep-link route `/tasks/:taskId` is explicitly a placeholder shell.

**Integration — 3/10.** React Query hooks include optimistic CRUD updates, but expect unwrapped `{ data, meta }` while the API returns an outer envelope. Realtime invalidation expects events that the task service does not emit for update/delete. Task routes send a workspace slug rather than an ID. Command-palette task deep links under project paths do not exist in the router (`/projects/:projectId/tasks/:taskId`).

**Production Readiness:** **Functional but Missing Polish**.

**Missing pieces.** Working API envelope/tenant contract; comments; stable detail route; assignee validation; complete filters; recurrence notifications/activity/realtime; update/delete broadcasts; project-route deep links; viewer write restrictions; mutation error feedback.

### Habits — **Partial**

**Overview.** Project-scoped habits can be created, edited, deleted, toggled, and displayed with basic streak totals.

**Backend — 6/10.** CRUD, Zod validation, `HabitCompletion`, activity logs, broadcasts, and project role checks exist. RRule fields are persisted but the create/edit UI does not configure them. Completion toggling is based on local server dates, not the habit timezone. Un-completing simply decrements the current streak and does not recompute historical streaks; recurrence rules are not used to decide whether the current date is due. Archived habits are neither excluded nor surfaced separately.

**Frontend — 5/10.** Create/edit dialogs, completion, focus-start action, loading/empty state, and responsive cards exist. The global Habits page silently chooses the first loaded project for creation, with no project selector. It treats all returned habits as active and has no query error state. The edit/delete controls work through the list, but dashboard habit cards supply no edit/delete actions. Focus controls are hover-only, limiting touch discoverability.

**Integration — 3/10.** React Query hooks exist but consume an outer API envelope as a habit array. Realtime broadcasts use `habit.*`, but `useRealtimeSync` has no habit subscriptions/invalidation. The dashboard reads all workspace habits rather than only habits visible through project membership.

**Production Readiness:** **Partial**.

**Missing pieces.** Correct response/tenant integration; recurrence configuration and timezone-aware due logic; accurate historical streak recomputation; archive behavior; project selection/filtering; realtime cache sync; error/feedback states; statistics/history view.

### Study Blocks — **Functional but Missing Polish**

**Overview.** The system supports one active focus block per user/workspace, timer display, completion, cancellation, project/habit/task links, and a floating active widget.

**Backend — 6/10.** Create, active lookup, update, complete, and cancel endpoints have Zod validation and persistence. Only the creator can access/update a block. Creation/completion record activity; cancellation and updates do not. Broadcasts occur, but no timer state is synchronized and no history endpoint exists. `create` requires only project viewer, allowing a viewer to create study blocks. There is no automatic completion when the planned duration elapses.

**Frontend — 5/10.** Study page has preset durations, countdown, project selection, start/complete/cancel controls, loading disabled state, and responsive layout. The countdown continues below zero but never completes the session. Notes are only sent at completion, and active session notes are not persisted through the update endpoint. No study history, task selection, pause, sound, notification, or error/empty state is implemented. If no project exists, start becomes inert without an explanatory empty state.

**Integration — 3/10.** Hooks cache the active block but treat static workspace slug as ID and consume unwrapped responses. Realtime listener only invalidates `['study-blocks']`, whereas active queries are keyed `['study-blocks', 'active', workspaceId]`; it also only listens to events emitted to a project room the user may not join. The dashboard is not reliably invalidated on completion/cancellation.

**Production Readiness:** **Functional but Missing Polish**.

**Missing pieces.** Working API contract; automatic duration behavior; session history; update/pause UX; error feedback; activity for cancel/update; project editor-level policy if required; consistent realtime and dashboard invalidation.

### Notes — **Functional but Missing Polish**

**Overview.** Notes have CRUD, Markdown editing/preview, pinning, local search, project/task persistence, permissions, activity, and embedding calls.

**Backend — 7/10.** Controller, Zod schemas, CRUD, project permissions, project/task links, pin field, activity logging, and note broadcasts are implemented. Notes must have a project (`projectId` is required), so this is not a workspace-wide note model. There is no server-side textual search, author relation/field, versioning, collaboration, or task-link selector UI. Update broadcasts to the original project room even if the note is moved to another project.

**Frontend — 6/10.** Markdown edit/preview, dialogs, pin action, responsive cards, local content/title search, and loading/empty states are implemented. The global Notes page silently assigns newly created notes to the first project; it has no project selector and no query-error state. Pinning has no immediate optimistic visual update. Accessibility is reasonable through Radix dialogs/tabs, but the clickable card is a `div` rather than a keyboard-operable control.

**Integration — 5/10.** Notes clients match the outer envelope for list/create/update and React Query invalidates mutations. They still use the invalid workspace slug. Realtime invalidation watches `['notes']`, but note hooks use `['workspaces', workspaceId, 'notes']`, so remote updates do not refresh note queries. Global search only searches cached notes.

**Production Readiness:** **Functional but Missing Polish**.

**Missing pieces.** Real workspace selection; server search; project/task selectors; author/version/history; robust moved-note broadcast; matching realtime cache keys; error and optimistic states; accessible card interaction.

### Resources — **Partial**

**Overview.** URL resources can be attached to tasks/projects, type-inferred, listed, opened, and deleted.

**Backend — 6/10.** CRUD, Zod schemas, type detection (GitHub/YouTube/PDF/website), metadata persistence, project permission checks, activity, broadcasts, and embeddings exist. Metadata is caller-supplied; there is no fetch, preview, OpenGraph extraction, title enrichment, or validation that a linked task belongs to the workspace/project. Updates are implemented but have no UI hook. Resources with `taskId` but no `projectId` bypass project permission checks.

**Frontend — 4/10.** Project and task resource displays, fast URL paste/Enter add, responsive cards, and project empty/loading state exist. There is no global resource page, filtering UI, edit UI, metadata/editor, preview, error state, or delete confirmation. `ResourceCard` calls `new URL(resource.url)` during render, which can throw for persisted invalid URLs despite UI validation.

**Integration — 3/10.** Resource React Query list/create/delete hooks exist, but receive an outer response envelope that is incompatible with their expected `{ data, meta }`. Realtime invalidation keys happen to be `['resources']` prefixes but feature requests still use workspace slug IDs. No metadata/preview integration exists.

**Production Readiness:** **Partial**.

**Missing pieces.** Working API contract; server-side URL metadata/OpenGraph and preview pipeline; update/filter UI; global library if desired; task/project ownership validation; safe URL rendering; error/confirmation UX; realtime query coverage.

### Dashboard — **Partial**

**Overview.** A backend aggregator and a visually complete command-center layout exist, but several metrics/charts are incomplete and its client path/auth are non-functional.

**Backend — 5/10.** `DashboardService` aggregates active due/overdue tasks, habits, active study block, focus, recent projects, activity, and a score. It lacks explicit authorization inside the service but inherits the membership guard. Recent projects/habits are workspace-wide and do not filter project membership. "Tasks completed today" uses `updatedAt`, so any later edit of a historic completed task counts as completed today. The score is calculated with documented weights but is named weekly while most inputs are daily. No historical time series is returned.

**Frontend — 5/10.** Dashboard has skeleton/error/empty states, responsive KPI cards, recent projects, task/habit views, and activity presentation. Charts are explicitly mock distributions derived from current aggregate values, not historical data. Task/habit cards are display-only here. There are no dashboard quick-action controls; the named quick actions are merely Command Palette navigation.

**Integration — 1/10.** `dashboardClient` calls `/workspaces/:id/dashboard` without `/api/v1` and without a bearer token. It also expects an unwrapped `DashboardResponse` though the server envelopes it. It cannot produce a usable dashboard with the current API. Realtime invalidation keys exist but task completion emits no `task.completed`; habit events are not subscribed; study events do not match the active query key.

**Production Readiness:** **Partial**.

**Missing pieces.** Correct authenticated endpoint/envelope; access-filtered aggregates; real historical metrics/charts; correct completion timestamps and score period; dashboard actions; complete realtime invalidation.

### Activity Feed — **Partial**

**Overview.** The application records lifecycle events to a shared `Activity` table and exposes workspace/project feed endpoints.

**Backend — 6/10.** Activity persistence, workspace/project feed controllers, cursor pagination, membership/project access filtering, and realtime broadcasts are implemented. Recording is intentionally fire-and-forget, so an activity failure is logged but does not fail the source mutation. Events are incomplete: task recurrence completion, task updates/deletions, study update/cancel, and project-member changes do not consistently produce activity. The API accepts arbitrary parsed `limit` values without a bounded DTO, and activity uses application-defined strings rather than database constraints.

**Frontend — 5/10.** The workspace page has loading, empty, refresh, pagination, and readable activity item components. The dashboard renders the ten most recent records. The Project Activity tab is static and does not use the existing project feed hook. There are no claimed action filters, entity navigation, realtime insertion, or error state in `ActivityList`.

**Integration — 3/10.** React Query infinite query is implemented, but it sends the workspace slug and assumes the feed response shape after global transformation. Realtime only invalidates `['activities']`, while activity queries use `['workspaces', workspaceId, 'activity']`; remote activity does not refresh the visible feed.

**Production Readiness:** **Partial**.

**Missing pieces.** Validated/bounded pagination; complete source instrumentation; working project activity page; matching response/query keys; entity links/filters/error state; tenant identity; realtime refresh.

### Calendar — **Partial**

**Overview.** A responsive, client-side monthly task due-date calendar is implemented.

**Backend — 0/10.** There is no calendar controller, service, range DTO, aggregation, calendar database model, activity, or realtime event.

**Frontend — 4/10.** Month navigation, task counts, selected-day agenda, skeleton, and empty agenda are implemented. It loads the default first page of tasks only, has no query-error state, includes no habits/study blocks/events, and does not link agenda items to details. No week/day views exist.

**Integration — 2/10.** It reuses task React Query without date-range fetching, pagination, or realtime. It inherits task response and workspace identity failures.

**Production Readiness:** **Partial**.

**Missing pieces.** Calendar aggregation API and range query; all required entity types; complete pagination/range loading; day/week views; detail navigation; errors/realtime; valid tenant/API contract.

### Analytics — **Scaffold Only**

**Overview.** Analytics is a presentational reuse of the dashboard component rather than an analytics implementation.

**Backend — 1/10.** No analytics endpoint, service, DTO, storage, permissions layer, or historical aggregation exists. Dashboard aggregates are the only data source.

**Frontend — 2/10.** It renders KPI cards, reused mocked charts, and a formula panel. When dashboard data is absent it supplies hard-coded values (score 85, 4 tasks, 75%, 120 minutes, 5-day streak, 12 hours). The formula card states focus is 40% and habits 20%, which contradicts the actual/documented 20% focus and 30% habits formula. It has skeletons but no genuine empty/error, date-range, filtering, or export states.

**Integration — 0/10.** No analytics query or API; it depends on the broken dashboard query.

**Production Readiness:** **Scaffold Only**.

**Missing pieces.** Analytics service/API and real data model; historical aggregation; date ranges/filtering; removal of fallback metrics/mock chart; accurate formula; loading/error/empty/export behavior.

### Achievements — **Scaffold Only**

**Overview.** The route renders a polished static achievements mockup.

**Backend — 0/10.** `User.xp` and `User.level` fields exist, but there is no achievement/badge model, controller, service, DTO, rule engine, activity consumer, queue/worker, validation, permissions, or realtime.

**Frontend — 2/10.** The layout is responsive and accessible in basic visual structure, but level 4, 750 XP, all achievements, unlock timestamps, and progress values are hard-coded constants. There are no loading, empty, error, or data-driven states.

**Integration — 0/10.** No query/store/socket/navigation action beyond the static route.

**Production Readiness:** **Scaffold Only**.

**Missing pieces.** Achievement schema/rules/XP transactions; API and React Query; data-driven UI; unlock processing; tests; notifications/realtime where required.

### AI — **Partial**

**Overview.** There is real OpenAI summarization, embedding generation, and pgvector similarity SQL on the backend, with a summary card and semantic-search UI hooks.

**Backend — 5/10.** The controller exposes summarize/search under workspace membership guards. `AiService` calls OpenAI for summaries and `text-embedding-3-small`, writes vectors using raw SQL, and runs a vector distance union across tasks, notes, and resources. It has no input DTO/length/limit validation; `limit` may be invalid; semantic search applies no project visibility filter after workspace matching, potentially returning content from inaccessible projects. Embeddings are fire-and-forget on task/note/resource mutations; no queue, retry, status, backfill, deletion cleanup, model version, cost/rate controls, or vector index migration is implemented. `aiSummary` is never persisted by the summary endpoint.

**Frontend — 2/10.** `AiSummaryCard` can request a summary and semantic result rendering exists in the command palette. There is loading feedback. Neither requests a Clerk token, both AI URLs are missing the `/api/v1` prefix (and begin with `/api`), and summary results are not saved to the entity. Semantic results navigate Notes to the list and Resources to Dashboard, not to a selected result.

**Integration — 1/10.** OpenAI/pgvector code exists but the web client cannot invoke it correctly. The schema declares pgvector, but the only checked-in migration predates `Resource`, `Note`, AI fields, and vector extension. No shared request validators exist for the AI endpoints.

**Production Readiness:** **Partial**.

**Missing pieces.** Correct authenticated client routes; validation/rate/cost/error controls; project access filtering; migration/index/backfill lifecycle; persisted summaries; result-specific navigation; tests and operational observability.

### Search — **Partial**

**Overview.** A Cmd/Ctrl+K command palette performs cache-local entity search and offers navigation quick actions. Semantic search is intended as an additional result source.

**Backend — 1/10.** There is no global keyword search API; only the AI semantic endpoint exists. No notification backend exists.

**Frontend — 5/10.** Cmd/Ctrl+K, recent local-storage items, basic command-menu accessibility, cache-local filtering for projects/tasks/habits/notes/resources/members, and quick navigation actions are implemented. Search only finds data previously fetched into exact React Query cache key shapes. Multiple key/data-shape mismatches prevent projects and members from being extracted as intended. Project task result paths do not match any router route. Semantic search's request path/auth are broken. No command execution exists for creating tasks or toggling theme.

**Integration — 2/10.** React Query cache search is intentionally limited and has no server fallback. Semantic search integration is non-functional as described under AI. Recent-items state is local only.

**Production Readiness:** **Partial**.

**Missing pieces.** Working API/local data contracts; server search/pagination; valid deep links; resilient cache-key handling; command actions; authenticated semantic search; result selection/navigation.

### Notifications — **Scaffold Only**

**Overview.** A notification button, local Zustand shape, and overlay presentation exist.

**Backend — 0/10.** No notification model, endpoints, delivery provider, preferences, activity-to-notification processor, or Socket.IO event exists.

**Frontend — 1/10.** The shell hard-codes count `3` and three notification preview records. The Zustand store is not wired to the UI or any data source. The overlay has no read/dismiss/navigation behavior.

**Integration — 0/10.** None.

**Production Readiness:** **Scaffold Only**.

**Missing pieces.** Entire notification system: persistence, APIs, user preferences, realtime/delivery, UI states/actions, and accessibility for the interactive feed.

### Settings — **Scaffold Only**

**Overview.** The settings page renders local profile/timezone/theme controls; workspace settings contains real member management but no workspace metadata persistence.

**Backend — 1/10.** User preferences fields exist, but no user settings or workspace settings API exists. Member APIs are separate and working in principle.

**Frontend — 2/10.** Inputs and save confirmation are local component state only. Display name, timezone, and appearance are never persisted; the appearance selection does not call the app theme store/provider. The page claims notifications but has no notification settings. Workspace project settings deliberately disables all persistence/destructive actions.

**Integration — 0/10.** No user/workspace settings React Query/mutations. The only integrated portion is members, which inherits workspace identity failure.

**Production Readiness:** **Scaffold Only**.

**Missing pieces.** User/workspace settings endpoints and validation; persistence; real theme preference binding; notification settings; workspace metadata; success/error handling; billing only when core workflows are complete.

## Cross-cutting systems

| System          | Score | Verified assessment                                                                                                                                                                                                                                                                                       |
| --------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React Query     |  4/10 | Used across domains with some optimistic task/project mutations, but key conventions are inconsistent and several clients consume incompatible server envelopes. No centralized response adapter/error strategy.                                                                                          |
| Zustand         |  3/10 | Stores exist for UI/theme/sound/accessibility/presence/notifications/workspace/study. Several are unused; workspace state is populated from static slugs; notifications/presence have no data source.                                                                                                     |
| Socket.IO       |  4/10 | Gateway verifies Clerk token and authorizes room joins. Project-room broadcasts omit workspace subscribers; client reconnect effect depends on `socket` and can recreate connections; hooks omit habits and have nonmatching invalidation keys. No Redis Socket.IO adapter for multi-instance deployment. |
| Prisma/database |  2/10 | Rich current schema and pgvector declaration exist, but a single checked-in migration is materially stale and even contains `TaskResource`, absent from current schema. `prisma migrate deploy` cannot produce the schema used by the application.                                                        |
| Shared package  |  5/10 | Shared domain types/Zod schemas are useful, but HTTP response envelopes and several endpoint payloads are not represented/consumed consistently. Project member and AI request DTOs are not shared/validated.                                                                                             |
| Docker          |  4/10 | Compose provisions pgvector PostgreSQL and Redis; Dockerfiles exist. Production compose defines only PostgreSQL/Redis, not API/web services, contradicting the README description. No migration/health orchestration for app services was verified.                                                       |
| CI/CD           |  4/10 | CI installs, builds shared, lints, typechecks, formats, and builds. Tests are commented out; there are no test files. Cached lint/typecheck output is not runtime verification. No deploy workflow, migration deployment, secret handling, security scanning, or preview/release process is present.      |
| Documentation   |  2/10 | Extensive documents exist but conflict materially with source, status, routes, migrations, and feature behavior; details follow.                                                                                                                                                                          |

## Documentation accuracy discrepancies

The following are source-verified conflicts with `CURRENT_STATE`, `ROADMAP`, `CHANGELOG`, and feature specifications.

| Documentation claim                                                                                     | Verified implementation                                                                                                                                                               | Discrepancy                                                         |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `09_CURRENT_STATE.md`: “All platform routes complete and operational.”                                  | Several routes are explicit static shells or non-functional API flows: task detail, project activity, settings persistence, achievements, notifications, analytics.                   | Route existence is reported as operational completion.              |
| `09_CURRENT_STATE.md` lists Habits/Notes/Study/Calendar/Analytics/Achievements as completed.            | Habits/Notes/Study have partial domain code but are blocked by tenant/response contracts; Calendar is task-only; Analytics has hard-coded fallback/mock data; Achievements is static. | Completion is materially overstated.                                |
| `13_ROADMAP.md`: Design System “IN PROGRESS”; expansion/API/UI milestones are future.                   | Schema/modules/UI for most domains are present.                                                                                                                                       | Roadmap is stale and does not represent current implementation.     |
| `14_CHANGELOG.md`: Dashboard charts are integrated productivity charts.                                 | `DashboardCharts` explicitly synthesizes `mockWeeklyData`; backend has no historical series.                                                                                          | Charts are placeholders, not implemented historical analytics.      |
| `14_CHANGELOG.md`: dashboard “realtime invalidation rules” reflect updates instantly.                   | Events/keys do not consistently match; task update/delete broadcasts are absent, habits are unsubscribed, and dashboard route/auth is broken.                                         | Real-time dashboard behavior is not verified.                       |
| `14_CHANGELOG.md`: Activity stream has action filters.                                                  | Activity page has refresh and pagination only; no filter controls or filter query API.                                                                                                | Claimed filters are absent.                                         |
| `docs/features/tasks.md`: “highly-polished Frontend UI Complete” and “Currently no recurring tasks.”    | Basic recurrence UI/backend cloning exists; comments and deep-link detail remain missing.                                                                                             | Both completion and limitation statements are outdated.             |
| `docs/features/habits.md` / `study.md` / `calendar.md`: “Not Started.”                                  | Partial implementations/routes/services exist.                                                                                                                                        | Feature specs are stale in the opposite direction.                  |
| `docs/features/notes.md`: Note has `authorId`; status completed.                                        | Current `Note` schema has no author; workflows are partial and integration is not production-functional.                                                                              | Schema and completion status conflict with source.                  |
| `docs/features/resources.md`: resources “currently only appear on Tasks.”                               | Project resources page and project overview resource section exist.                                                                                                                   | Scope statement is outdated.                                        |
| `docs/features/projects.md`: Project activity is planned and Settings needs refinement.                 | Activity route exists but is a static placeholder; settings controls are disabled.                                                                                                    | “Route exists” must not be read as implementation.                  |
| `docs/features/activity.md`: realtime/push/presence are deferred.                                       | Socket activity events and frontend activity invalidation exist; push/presence remain absent.                                                                                         | Realtime status is stale; presence/push statement remains accurate. |
| `docs/features/search.md`: supported entities are Projects/Tasks/Notes/Resources.                       | Habits and members are also searched from cache; semantic search is attempted.                                                                                                        | Scope is outdated.                                                  |
| `README.md`: Redis includes BullMQ runner; production compose is production-ready and includes API/Web. | No BullMQ dependency/worker is present; `docker-compose.yml` only declares PostgreSQL and Redis.                                                                                      | Architecture/deployment claims are inaccurate.                      |

## Technical debt

### 🔴 Critical

- Static workspace slugs are used as database IDs throughout web requests; seeded identity does not match the UI's static workspace list.
- Global API response envelope and feature-client response contracts are incompatible. Projects additionally return `items` while pages expect `data`.
- Dashboard and AI clients omit Clerk authorization and call paths inconsistent with the Nest `/api/v1` global prefix.
- Prisma migrations do not represent the current schema; deployment migration cannot create the current domains, enums, invitation fields, or vector fields.
- No automated tests are present; CI's test job is commented out.

### 🟠 High

- `ProtectedLayout` does not protect routes; no user synchronization makes valid Clerk users fail API authentication.
- Project Activity, task deep-link detail, settings persistence, achievements, notifications, and analytics are placeholder/static despite product-facing routes.
- Project/habit/task/resource permissions have verified gaps (viewer writes for unprojected tasks/study, unvalidated assignees/task links, unavailable visibility model).
- Realtime event emission, room scope, and query invalidation are inconsistent; multi-instance Socket.IO has no adapter.
- AI semantic search does not apply project membership filtering and vector lifecycle has no migration/index/backfill/operational controls.

### 🟡 Medium

- Dashboard metrics use `updatedAt` as completion time, mix daily inputs into a “weekly” score, expose inaccessible project/habit data, and render mock charts.
- Habit recurrence/streak computation is not timezone- or history-correct; archived habits are not handled.
- Calendar only loads the default task page and excludes habits/study blocks.
- Error/loading/empty and mutation-feedback quality is inconsistent across project, habit, resource, study, and settings flows.
- User/workspace navigation, badges, notifications, presence, and shell profile data are hard-coded.
- Raw SQL (`$executeRawUnsafe`/`$queryRawUnsafe`) is used in AI without validated query limits or a managed operational layer.

### 🟢 Low

- Some interactive cards/actions are mouse-first rather than keyboard-operable; hover-only actions reduce mobile discoverability.
- Text contains mojibake characters in several visible strings.
- Resource render path assumes a parseable URL; destructive actions use browser confirms rather than consistent dialogs.
- Redis client/caching helpers are implemented but no feature service uses them.

## Overall scores

| Area                             |    Score | Rationale                                                                                                                         |
| -------------------------------- | -------: | --------------------------------------------------------------------------------------------------------------------------------- |
| Architecture                     |     4/10 | Sound monorepo/module intentions, undermined by tenant/API-contract split and stale migrations.                                   |
| Backend                          |     5/10 | Many real services/guards exist; lifecycle, validation, permissions, and deployment gaps remain.                                  |
| Frontend                         |     5/10 | Considerable responsive component work; several pages are static and core routes cannot consume current APIs.                     |
| Database                         |     2/10 | Rich schema, but migration history is not deployable to it.                                                                       |
| Realtime                         |     4/10 | Authenticated rooms/broadcast foundation exists; event and cache semantics are incomplete.                                        |
| AI                               |     3/10 | Real service code, but insecure/incomplete integration and absent vector lifecycle.                                               |
| Performance                      |     3/10 | Pagination exists in places, but no performance tests/index migration/caching use; dashboard scans broadly.                       |
| UX                               |     4/10 | Good visual groundwork and some states, but broken contracts, static data, and missing feedback prevent reliable workflows.       |
| Accessibility                    |     5/10 | Radix primitives/labels/focus styles are used, with interactive-div, hover-only, and keyboard gaps.                               |
| Maintainability                  |     4/10 | TypeScript/shared package help, but divergent API shapes, duplicated clients, stale docs/migrations, and unused stores add risk.  |
| Scalability                      |     3/10 | Postgres/Redis/pgvector are selected, but no deployment topology, socket adapter, queues, migrations, or access-safe aggregation. |
| Documentation                    |     2/10 | Broad coverage but status and implementation claims are unreliable.                                                               |
| Testing                          |     0/10 | No tests discovered; CI does not execute tests.                                                                                   |
| Deployment Readiness             |     1/10 | Migration drift, no app services in production compose, unverified env/API behavior, and no deployment workflow.                  |
| **Overall Production Readiness** | **2/10** | **Not production-ready. Core tenant identity and API contracts must be made coherent before feature polish.**                     |

## Final summary

### Actually complete features

- Backend foundations for authenticated, membership-guarded CRUD in tasks, notes, resources, habits, study blocks, projects, members, activity, and project membership.
- Task list UX mechanics: quick add, filters, optimistic mutation design, detail sheet, and keyboard navigation.
- Markdown edit/preview and note pin persistence.
- Socket connection authentication and authorized workspace/project room joins.
- Static responsive visual layouts for the shell, dashboard, calendar, analytics, and achievements.

### Partially complete features

- Authentication and member administration.
- Projects and project permissions.
- Tasks (including basic recurrence/assignee data, but excluding comments and working deep links).
- Habits, study blocks, notes, resources, dashboard, calendar, AI, command palette, activity.
- React Query, Zustand, Socket.IO, Prisma, Docker, CI.

### Placeholder features

- Task deep-link detail route.
- Project Activity tab.
- Analytics data and charts.
- Achievements/XP/badges.
- Notifications.
- User/workspace settings persistence.
- Workspace lifecycle and server-derived switcher.

### Features that need polish after the critical integration work

- Task comments, complete filtering, recurrence observability, and accessible detail flow.
- Habit recurrence/streak correctness and project selection.
- Study history/automatic timer completion and session editing.
- Resource previews/OpenGraph and safe destructive UX.
- Dashboard historical charts, correct metrics, and real actions.
- Calendar range/views/entity aggregation.
- Permission-aware controls, feedback, mobile/touch action visibility, and accessible card interactions.

### Features that should be built next

1. Make workspace IDs/slug resolution and API response envelopes consistent across the whole web/API boundary.
2. Generate and verify migrations that exactly match the current Prisma schema, then add integration tests around authentication, tenant isolation, and primary CRUD flows.
3. Correct dashboard/AI endpoint/auth clients and establish a shared typed API-response adapter.
4. Complete project/activity/task-detail/settings workflows only after the above base is proven end-to-end.
5. Build real historical analytics/calendar aggregation and a durable notification/achievement system after core data correctness.

### Features that should not be built yet

- Billing/Stripe, social leaderboards, video/audio huddles, external calendar sync, and additional AI capabilities.
- More dashboard visualizations, achievement badges, or notification presentation.
- New workspace/project routes or advanced search backends.

Those additions would compound the unresolved identity, response-contract, migration, permission, and test gaps.
