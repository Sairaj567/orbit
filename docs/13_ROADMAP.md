# 13 Roadmap

**Last verified:** 2026-07-26
**Source of truth for feature completeness:** [Feature Completeness Report](./FEATURE_COMPLETENESS_REPORT.md)

## Completed foundation

- Monorepo, React/Vite, NestJS, Prisma, Redis, shared types/validators, Dockerfiles, and CI.
- Core domain persistence and partial API/UI implementation for workspaces, members, projects, tasks, habits, study blocks, notes, resources, activity, dashboard, search, and settings.
- Clerk authentication, JIT user provisioning, and signed user webhooks.

Completion of a foundation is not a production-readiness claim. The following phases are ordered by risk and dependency.

## Phase 0 — Documentation and release baseline (current)

- Align current-state, roadmap, change log, and feature specifications with source verification.
- Run fresh CI verification for release candidates.
- Build API and web Docker images in CI.
- Maintain a release checklist including migrations and E2E validation.

## Phase 1 — Core flow correctness

- Repair Project Hub `workspaceSlug` routing.
- Implement protected route behavior and dynamic user identity.
- Finish project create/settings/archive/delete and Project Activity UI.

## Phase 2 — Authorization and data isolation

- Implement project visibility semantics.
- Apply project membership filtering to Dashboard and AI semantic search.
- Validate cross-entity links and Project Member mutation bodies.
- Add authorization E2E coverage.

## Phase 3 — Realtime correctness

- Stabilize Socket.IO provider lifecycle.
- Emit and consume all declared domain events.
- Align React Query keys with realtime invalidation.
- Test multi-user permissions and eviction with real sockets.

## Phase 4 — Complete existing core workflows

- Tasks: comments, deep-link detail, category management, validation, recurrence reliability.
- Habits: recurrence configuration, timezone-correct streaks, history/statistics.
- Study Blocks: history, auto-completion/notification, pause and linked-entity validation.
- Notes/Resources: selectors, server search/metadata, accessible and safe presentation.
- Invitations: delivery, acceptance, expiration, revocation, and pending-member linking.

## Phase 5 — Data-backed insights

- Replace analytics fallback/mock data with historical, permission-safe aggregation.

## Phase 6 — Deployment and operations

- Production app orchestration, controlled migrations, secret management, observability, backups, restore testing, deployment/rollback pipeline.

## Deferred until phases 1–3 are complete (Future v1 Epics)

- Achievements v1 Epic (Full gamification engine, badge models, XP rules engine deferred to a future separately-scoped epic).
- Notifications v1 Epic (Schema, notification center, push/email delivery channels deferred to a future separately-scoped epic).
- Calendar integrations.
- Additional AI workflows.
