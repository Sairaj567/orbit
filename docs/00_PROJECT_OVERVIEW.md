# 00 Project Overview

## What is Orbit?
Orbit is a shared productivity and life management system. It allows users to co-manage tasks, habits, study blocks, notes, and analytics with real-time synchronization, gamification, and deep integrations.

## Architecture
Orbit is architected as a modular, containerized monorepo built to scale from two users to multi-tenant workspaces. It leverages Turborepo and pnpm workspaces.

## Monorepo Apps & Packages
- **`/apps/web`**: Single Page Application built with React 19, Vite, Tailwind CSS v4, and shadcn/ui.
- **`/apps/api`**: Application backend built with NestJS, integrated with Prisma ORM, Redis caching/messaging, BullMQ background queues, and Clerk Auth.
- **`/packages/shared`**: A compiled internal package exporting shared interfaces, TypeScript types (e.g. enums, DTO models), status/priority constants, and Zod validator schemas used by both the frontend and backend.

## Deployment
Docker containerized (multi-stage builds for API and Web), backed by PostgreSQL and Redis.

## Current Phase
We have just completed **Milestone 1 (Foundation)**. The monorepo, database schema (base), and development environment are set up and functioning. We are moving into **Milestone 2 (Design System)**.
