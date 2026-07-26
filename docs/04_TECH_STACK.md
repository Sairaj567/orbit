# 04 Tech Stack

This document serves as the definitive list of dependencies for Orbit.

## Monorepo & Build

- **Turborepo** (^2.5.0)
- **pnpm** (^9.15.0)
- **TypeScript** (^5.7.0)
- **ESLint** (^9.0.0) + Prettier + Husky

## Frontend (`@orbit/web`)

- **React** & **React DOM** (^19.1.0)
- **Vite** (^6.3.0)
- **React Router** (^7.6.0)
- **Zustand** (^5.0.0)
- **@tanstack/react-query** (^5.75.0)
- **Tailwind CSS** (^4.1.0)
- **shadcn/ui** (Radix UI + class-variance-authority + clsx + tailwind-merge)
- **Framer Motion** (^12.0.0)
- **Lucide React** (^0.475.0)
- **Sonner** (^2.0.0)

## Backend (`@orbit/api`)

- **NestJS** (^11.0.0)
- **Prisma ORM** (^6.0.0)
- **PostgreSQL with pgvector** (`pgvector/pgvector:pg17`)
- **Redis (ioredis)** (^5.4.0)
- **Clerk Auth** (`@clerk/backend` ^3.11.4)
- **Socket.io** (via `@nestjs/platform-socket.io`)
- **Class Validator / Transformer** for validation payloads.

## Database Local Development Environment

- **Standardized Local Database Environment:** Local development requiring vector search features (`pgvector` extension and 1536-dimensional embeddings) MUST run PostgreSQL via Docker (`docker-compose.dev.yml` using `pgvector/pgvector:pg17`).
- **Native Host Requirement Note:** Native Windows PostgreSQL installers do not contain pre-compiled `pgvector` binaries (`vector.control`) out of the box; native host installations should not be used as the primary dev database for vector features.
