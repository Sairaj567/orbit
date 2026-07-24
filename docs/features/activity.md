# Activity & Event System

## Overview

The Activity system in Orbit is a unidirectional event-logging engine designed to track important user actions across workspaces and projects.

At this stage (Milestone 6.1 - Foundation), it operates purely as an **event producer** combined with basic REST endpoints for **passive consumption** (e.g., displaying activity feeds). Features like real-time WebSockets, push notifications, and presence are explicitly deferred.

## Architecture

We use a unified `Activity` table to store all events to avoid complex polymorphic relations and migration headaches during rapid feature development.

### Core Model

```prisma
model Activity {
  id          String   @id @default(cuid())
  workspaceId String
  projectId   String?  // Optional, depending on entity scope
  userId      String   // The actor
  actorName   String?
  entityType  String   // E.g., 'TASK', 'PROJECT', 'MEMBER'
  entityId    String
  action      String   // E.g., 'CREATED', 'UPDATED', 'COMPLETED'
  metadata    Json?    // Flexible schema for entity-specific data
  createdAt   DateTime @default(now())

  // Relations
  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  project   Project?  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([workspaceId, createdAt])
  @@index([projectId, createdAt])
}
```

### TypeScript Literal Unions

Instead of using Prisma `enum` types for `entityType` and `action`, we define them as TypeScript literal unions in `@orbit/shared/src/types/activity.ts`. This allows us to add new entity types and actions without running database migrations, which is critical for development velocity.

```typescript
export type ActivityEntityType =
  | 'TASK'
  | 'PROJECT'
  | 'NOTE'
  | 'RESOURCE'
  | 'MEMBER'
  | 'WORKSPACE';

export type ActivityAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'COMPLETED'
  | 'ASSIGNED'
  | 'INVITED'
  | 'JOINED'
  | 'REMOVED';
```

## Backend Services

The `ActivityService` is injected globally into feature modules (e.g., `TasksService`, `ProjectsService`, `MembersService`) to record activities organically during lifecycle events.

- `recordActivity`: Saves an event. Fails gracefully (catch block without re-throwing) to prevent breaking the main transaction.
- `getWorkspaceActivity`: Retrieves a paginated feed of workspace-level activity.
- `getProjectActivity`: Retrieves a paginated feed of project-specific activity.

## Frontend Hooks and UI

The frontend consumes this system using standard TanStack Query patterns.
- `useWorkspaceActivity(workspaceId)`
- `useProjectActivity(workspaceId, projectId)`
- `<ActivityList />` - Renders an infinite-scroll list of activities.
- `<ActivityItem />` - Renders a single activity with an avatar, actor name, action description, and relative timestamp.

## Future Stages (Deferred)

- **Notifications**: Aggregating activities to generate email and push notifications.
- **WebSockets**: Streaming activities in real-time to connected clients.
- **Presence**: Showing active users in a workspace or project.
- **Analytics**: Aggregating activity data for reporting.
