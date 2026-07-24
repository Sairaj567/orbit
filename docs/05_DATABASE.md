# 05 Database

Orbit uses **PostgreSQL** via **Prisma ORM**.

## Current Schema (Milestone 1)
Located at `/apps/api/prisma/schema.prisma`

### Models
- **User**: Stores user identity, mapped to `clerkId`. Includes preferences, xp, and level.
- **Workspace**: Multi-tenant container. Includes slug, settings, invite codes.
- **WorkspaceMember**: Join table between User and Workspace defining `WorkspaceRole` (OWNER, ADMIN, MEMBER, VIEWER).

## Future Models (Milestone 3+)
- **Task**: Linked to Workspace. Includes status, priority, due dates, assignee.
- **Habit**: Linked to Workspace/User. Includes frequency, streak tracking.
- **Note**: Linked to Workspace. Rich text document.
- **StudyBlock**: Represents a focused session.

## Conventions
- Use `cuid()` for all Primary Keys (`id`).
- Always include `createdAt` and `updatedAt`.
- Use soft deletes (`deletedAt DateTime?`) where appropriate.
- Never write raw SQL unless absolutely necessary; prefer Prisma Client.
