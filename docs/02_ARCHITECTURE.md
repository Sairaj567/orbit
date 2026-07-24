# 02 Architecture

## High-Level Architecture
Orbit uses a modern Monorepo approach managed by Turborepo and pnpm, ensuring code sharing and fast builds.

## 1. Frontend (`/apps/web`)
- **Framework**: React 19 SPA served via Vite.
- **Routing**: React Router v7.
- **State Management**: Zustand (Client State), React Query (Server/Async State).
- **Styling**: Tailwind CSS v4 + shadcn/ui.
- **Communication**: REST APIs (and WebSockets via Socket.io for real-time updates).

## 2. Backend (`/apps/api`)
- **Framework**: NestJS v11.
- **Database**: PostgreSQL accessed via Prisma ORM v6.
- **Caching & Queues**: Redis via `ioredis` and BullMQ for background jobs.
- **Auth**: Clerk Auth via `@clerk/backend` with custom guards.
- **Real-time**: `@nestjs/websockets` + Socket.io.

## 3. Shared Library (`/packages/shared`)
- Single source of truth for DTOs, Enums, Zod schemas, and Types.
- Consumed by both Web and API.

## 4. Infrastructure
- **Development**: Docker Compose (`docker-compose.dev.yml`) for Postgres and Redis.
- **Production**: Dockerfiles for Web (static server) and API (Node server).
