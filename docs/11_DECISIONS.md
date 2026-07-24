# 11 Decisions

This document tracks important architectural decisions for Orbit. Detailed context can be found in the `docs/adr/` directory.

## Log

### ADR-001: Monorepo Architecture
- **Decision**: Use Turborepo and pnpm workspaces.
- **Reason**: To share code (types, DTOs, schemas) seamlessly between the frontend and backend.
- **Impact**: Faster builds, unified linting, slightly more complex initial setup.
- **Date**: Project Inception
- **Status**: Approved & Implemented

### ADR-002: Workspace Routing
- **Decision**: Multi-tenant environment using a workspace slug or ID in the URL.
- **Reason**: Allows users to switch contexts easily without logging out.
- **Impact**: Requires strict route guards and Prisma row-level validation based on the active workspace.
- **Date**: Project Inception
- **Status**: Approved

### ADR-003: Theme System
- **Decision**: Use Tailwind CSS v4 and shadcn/ui.
- **Reason**: Modern, CSS-first token system and accessible unstyled components.
- **Impact**: Rapid UI development, easy theming support.
- **Date**: Project Inception
- **Status**: Approved

### ADR-004: State Management
- **Decision**: Zustand for client state, React Query for server state.
- **Reason**: Separation of concerns; prevents stale data issues and bloated Redux stores.
- **Impact**: Clear guidelines needed for when to use which (see `07_UI_GUIDELINES.md`).
- **Date**: Project Inception
- **Status**: Approved
