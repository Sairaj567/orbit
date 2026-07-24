# ADR-001: Architecture

## Context
We need a scalable project structure that allows us to share types and validation logic between the React frontend and the NestJS backend to avoid duplication and ensure type safety across the network boundary.

## Decision
We will use a Monorepo powered by Turborepo and pnpm workspaces. The structure will divide into `/apps` (web, api) and `/packages` (shared).

## Consequences
- **Positive**: Single source of truth for DTOs and Zod schemas. Streamlined CI/CD caching via Turborepo.
- **Negative**: Slight increase in build complexity. Requires building the `shared` package before dependent apps can consume updates.

## Alternatives
- Two separate repositories: Rejected due to type duplication overhead.
- Nx instead of Turborepo: Rejected as Turborepo is lighter and sufficient for our current stack size.

## Status
Approved & Implemented
