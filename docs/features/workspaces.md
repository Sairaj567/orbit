# Workspace Members & Invitations

## Overview
Workspace Members and Invitations allow users to collaborate on projects. Orbit's differentiator is seamless collaboration.

## Features
- **Member Management**: View all workspace members.
- **Roles**:
  - `OWNER`: Full control, cannot be removed, cannot change role.
  - `ADMIN`: Can invite and manage members, update roles (except Owner), and remove members (except Owner).
  - `MEMBER`: Regular collaborator. Can view members but cannot manage them.
  - `VIEWER`: Read-only access (future implementation).
- **Invitations**: 
  - Admins and Owners can invite members via email.
  - Generates a pending invitation in the workspace.
- **Global Search**:
  - Use `Cmd+K` to search for members by name or email.

## Architecture
- `WorkspaceMember` model in Prisma.
  - `userId` (optional)
  - `email` (for pending invites)
  - `status` (`ACTIVE`, `PENDING`)
- `MembersModule` in NestJS API for CRUD.
- Enforced by `WorkspaceMembershipGuard`.
