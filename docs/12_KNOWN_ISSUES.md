# 12 Known Issues

This document tracks current limitations and known bugs in the system that do not immediately block development but need to be addressed eventually.

## Process & Tooling Risks

### 1. `prisma migrate resolve --applied` Silent Success Risk

- **Risk Description:** Running `prisma migrate resolve --applied <migration_name>` marks a migration as completed in `_prisma_migrations` without executing or validating the migration SQL against the target database. If underlying DDL statements (such as `CREATE EXTENSION` or column creation) failed or were skipped, `prisma migrate status` will report "up to date" even though the database schema is incomplete.
- **Mandatory Policy:** Never run `prisma migrate resolve --applied` without first executing and verifying the DDL statements directly against the target database using raw catalog queries (`pg_extension`, `information_schema.columns`).

## Local Development Gaps

### 2. Native Windows PostgreSQL `pgvector` Extension & Embedding Columns Gap

- **Gap Description:** The `pgvector` extension is not installed in the native Windows PostgreSQL 17 local development environment. Official `pgvector` releases ship no Windows binaries, and third-party community DLL builds were assessed and rejected due to ABI mismatch and service crash risks.
- **Affected Columns & Features:**
  - `Task.embedding`, `Resource.embedding`, and `Note.embedding` columns do not exist in the native Windows dev database.
  - `AiService.embedEntity()` and `AiService.semanticSearch()` will catch database errors via their internal `try/catch` blocks and silently no-op / log handled errors.
- **Unaffected Features:** `aiSummary` columns (plain `TEXT`, no extension dependency) **DO exist** on `Task`, `Resource`, and `Note` tables and function normally.
- **Resolution Path:** Switch local development to the Docker-based PostgreSQL container (`pgvector/pgvector:pg17` defined in `docker-compose.dev.yml`) before work on the AI module's embedding/semantic-search features (Epic 3/4) begins.

### 3. `Project.creatorId` Foreign Key Relation Gap

- **Gap Description:** `Project.creatorId` lacks a foreign key relation (`@relation`) to `User.id` in `schema.prisma` (it is defined as a plain `String` column). As a result, it is not covered by automatic database cascade rules or `user.deleted` relation handlers.
- **Impact:** After a user is deleted, any project created by that user retains a dangling `creatorId` string with no cleanup and no DB-level constraint error to surface it.
- **Resolution Path:** Consider adding a proper `@relation` foreign key mapping between `Project.creatorId` and `User.id` in a future Prisma migration.

### 4. Mid-Session Socket JWT Expiration

- **Accepted Tradeoff:** WebSocket connection authentication via `verifyToken` occurs once during initial handshake. If a Clerk JWT expires mid-session, the active socket connection remains open until the client disconnects or reloads.

## Architectural Findings & Deferred Production Hardening Items

### 5. Silent NestJS Dependency Injection Resolution Defect (`AuthModule`)

- **Defect Description:** Controllers across 8 feature modules (`WorkspacesModule`, `TasksModule`, `NotesModule`, `ResourcesModule`, `ProjectsModule`, `HabitsModule`, `StudyBlocksModule`, `SearchModule`) apply `@UseGuards(ClerkAuthGuard, WorkspaceMembershipGuard)`. `ClerkAuthGuard` requires `UserProvisioningService`. Prior to Epic 5 Stage D, `AuthModule` was neither marked `@Global()` nor imported in any of these 8 feature modules.
- **Why It Was Undetected:** No real HTTP requests had been sent to a running dev server instance for these controllers. Static compilation checks (`tsc --noEmit`, `eslint`, `nest build`) do not instantiate NestJS's runtime dependency injection container and therefore cannot catch missing module imports.
- **How It Was Discovered:** Discovered during Epic 5 Stage D Rank 1 E2E testing when `Test.createTestingModule({ imports: [AppModule] })` initialized the full NestJS module graph, raising a runtime `Nest can't resolve dependencies of the ClerkAuthGuard` exception.
- **Resolution:** `AuthModule` was decorated with `@Global()` in `apps/api/src/auth/auth.module.ts`, bringing it into structural alignment with `PrismaModule` and `ProjectPermissionsModule` and resolving `ClerkAuthGuard` dependencies globally across all controllers.

### 6. Foreign Key Constraint Violation in `user.deleted` Webhook (`Task_creatorId_fkey`)

- **Defect Description:** Hard-deleting a user record (`await prisma.user.delete()`) when that user had created tasks in a sole-member or empty workspace resulted in PostgreSQL throwing a runtime foreign key constraint violation (`Task_creatorId_fkey`). `Task.creatorId` is a required non-nullable foreign key referencing `User.id` without `ON DELETE CASCADE`.
- **Why Mocked Unit Tests Missed It:** Unit tests in Batch 3 mocked `prisma.user.delete` with `jest.fn()`. Mocked functions swallow calls without executing SQL queries or enforcing PostgreSQL database constraints.
- **How It Was Discovered:** Discovered during Epic 5 Stage D Rank 2 E2E testing when real Clerk `user.deleted` webhooks were executed against the live `orbit_test` PostgreSQL database.
- **Resolution:** Upgraded the `User` model to support soft-deletion (`deletedAt DateTime?` via migration `20260725171500_add_user_deleted_at`). `WebhooksService.handleUserDeleted` now soft-deletes the `User` record (`data: { deletedAt: new Date() }`), preserving orphaned task data and history in sole-member workspaces. Application-level cleanup explicitly removes active `TaskAssignee` and `WorkspaceMember` records for the soft-deleted user, while `ClerkAuthGuard` and `RealtimeGateway` reject authentication and socket connections for soft-deleted accounts (`deletedAt !== null`).

### 7. Inert `User.xp` and `User.level` Schema Fields

- **Note:** `User.xp` and `User.level` exist in `schema.prisma` and `packages/shared` types (defaulting to 0 and 1), but are currently unused pending a future Achievements v1 epic. They are retained in the database schema to avoid unnecessary migration risk.

### 8. Deferred Sentry Error Tracking Integration

- **Status:** Explicitly deferred pending production Sentry account creation and DSN configuration decisions.
- **Impact:** Exception filters currently output structured JSON logs via Pino to stdout/stderr. Production error aggregation and alert dispatching require wiring `@sentry/node` into `AllExceptionsFilter`.

### 9. Deferred Prometheus / OpenTelemetry Metrics Collection

- **Status:** Deferred for single-VM production scale.
- **Impact:** System performance and latency are evaluated via HTTP response logging and the `/health` endpoint. High-cardinality connection metrics (DB pool metrics, Redis memory stats) can be added via `@willsoto/nestjs-prometheus` in a future multi-node scaling epic.

### 10. Single-Instance Socket.IO Realtime Gateway Limitation

- **Status:** Confirmed single-instance-only architecture.
- **Impact:** `RealtimeGateway` manages active WebSockets in an in-memory map without `@socket.io/redis-adapter`. On a single-VM deployment, all clients connect to the single container instance. Expanding to multi-VM horizontal scaling requires configuring `socket.io-redis-adapter` to sync events across peer API instances via Redis pub/sub.
