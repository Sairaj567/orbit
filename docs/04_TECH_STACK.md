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
- **Redis (ioredis)** (^5.4.0)
- **Clerk Auth** (`@clerk/backend` ^3.11.4)
- **Socket.io** (via `@nestjs/platform-socket.io`)
- **Class Validator / Transformer** for validation payloads.
