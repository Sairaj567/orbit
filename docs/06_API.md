# 06 API

Orbit exposes a REST API via NestJS and real-time updates via WebSockets.

## REST Architecture
- **Controllers**: Handle HTTP routing and basic parameter validation.
- **Services**: Contain business logic and interact with Prisma.
- **DTOs**: Defined in `@orbit/shared`, used by NestJS `ValidationPipe`.

## Authentication & Authorization
- **Clerk**: Secures endpoints. A custom NestJS Guard intercepts the request, validates the Clerk JWT, and attaches the `User` object to the request context.
- **Workspace Context**: Most endpoints will require a `workspaceId` header or route parameter, validated against `WorkspaceMember` records.

## Real-time (WebSockets)
- Implemented via `@nestjs/websockets` (Socket.io).
- Emits events on mutations (e.g., `task.created`, `habit.updated`) to active clients in the corresponding workspace room.

## Caching
- Redis is used for rate limiting, caching expensive queries, and Pub/Sub across instances.
