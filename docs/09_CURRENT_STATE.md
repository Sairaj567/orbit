# 09 Current State

**Last verified:** 2026-07-26
**Authoritative audit:** [Feature Completeness Report](./FEATURE_COMPLETENESS_REPORT.md)

## Track

Orbit has a functioning monorepo, API, web client, Prisma schema, Clerk integration, database migrations, Dockerfiles, and CI. It is **not production ready**. The current production-readiness score is **4/10 (Partial)**.

### Verified foundations

- Turborepo with React/Vite web app, NestJS API, Prisma/PostgreSQL, Redis, and shared package.
- Clerk JWT verification, just-in-time user provisioning, signed user webhooks, and profile update API.
- Workspace list/update, member CRUD, task CRUD, project CRUD, notes, resources, habits, study blocks, activity records, and dashboard aggregation.
- Shared Zod validation and API response envelope.
- Socket.IO authentication, room membership checks, and eviction support.
- Unit tests, database-backed E2E tests, Dockerfiles, and CI workflow are present.

### Verified production blockers

1. Project list and Project Hub use a nonexistent `workspaceId` router parameter instead of `workspaceSlug`, breaking project navigation and all nested tabs.
2. `ProtectedLayout` does not protect unauthenticated routes.
3. Socket lifecycle/event coverage and React Query invalidation are incomplete.
4. Dashboard and AI semantic search do not fully apply project-level access filtering.
5. Analytics uses hard-coded fallback/mock chart data; Achievements and Notifications unbacked fake UIs have been removed.
6. Documentation previously overstated feature completion.

### Feature status

| Status                        | Features                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Functional but missing polish | Authentication, Members, Tasks, Study Blocks, Notes, Settings                                                |
| Partial                       | Workspaces, Projects, Project Permissions, Habits, Resources, Dashboard, Activity Feed, Calendar, AI, Search |
| Scaffold only                 | Analytics data product, task deep-link detail, Project Activity UI, Project Settings actions                 |
| Removed (unbacked fake UI)    | Achievements, Notifications bell / overlay                                                                   |

## Current delivery priority

1. Phase 0 — Documentation and release baseline.
2. Phase 1 — Project routing, route protection, and usable Project Hub.
3. Phase 2 — Permission/data-isolation hardening.
4. Phase 3 — Realtime lifecycle and cache correctness.
5. Phase 4 — Finish existing core workflows before expanding scope.

See [10 Next Steps](./10_NEXT_STEPS.md) and [13 Roadmap](./13_ROADMAP.md) for the delivery sequence.
