# 10 Next Steps

**Current priority:** Production-readiness Phase 0.

## Now

1. Keep the documentation aligned with [Feature Completeness Report](./FEATURE_COMPLETENESS_REPORT.md).
2. Make CI execute fresh verification and container-image builds for release candidates.
3. Verify the database-dependent E2E suite in CI before every release candidate.

## Next: core blockers

1. Fix Project Hub routing (`workspaceSlug` versus `workspaceId`).
2. Add real protected-route behavior.
3. Close Dashboard and AI project-membership data leaks.
4. Stabilize Socket.IO connection lifecycle and event/query invalidation coverage.

## Then: finish existing workflows

- Task comments and deep-link detail.
- Invitation lifecycle.
- Habit/study correctness and history.
- Project settings/activity.
- Real historical analytics.

## Do not start yet

- Achievements, notifications, more AI surfaces, or calendar integrations. These are not production-ready feature foundations.
