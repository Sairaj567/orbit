# ADR-002: Workspace Routing

## Context
Orbit targets both individual users and collaborative teams. Data must be segregated securely, and users need a way to seamlessly switch between different groups they are a part of.

## Decision
We will implement a multi-tenant workspace model where the URL contains the workspace identifier (e.g., `app.orbit.com/:workspaceSlug/dashboard`). Every backend request must be authenticated AND authorized against the specific workspace context.

## Consequences
- **Positive**: Extremely clear context. Easy to implement role-based access control per workspace.
- **Negative**: Users must have at least one default workspace created for them upon sign-up to see the app. Global views (across workspaces) will be harder to implement.

## Alternatives
- Implicit context switching via session/cookie state: Rejected because it breaks when users open multiple tabs for different workspaces.

## Status
Approved
