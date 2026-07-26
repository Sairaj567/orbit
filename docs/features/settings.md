# Settings Feature

## Purpose

Manage workspace settings, user preferences, billing, and member roles.

## Status

Functional but Missing Polish. User profile/timezone/theme and workspace metadata/member settings are wired to APIs. Billing, notification preferences, account/security management, complete timezone choices, and a workspace creation entry point are absent.

## Dependencies

- Clerk Auth (for profile management)

## Database models

- `Workspace` (settings JSON)
- `User` (preferences JSON)

## API endpoints

- `PATCH /api/v1/workspaces/:workspaceId`
- `POST /api/v1/workspaces/:workspaceId/members`
- `PATCH /api/v1/users/me`

## UI components

- `SettingsLayout`
- `ThemeToggle`
- `MemberManagementTable`

## Future enhancements

- Stripe integration for premium workspaces.

## Known limitations

- None.

## Implementation checklist

- [ ] Build forms for workspace metadata
- [ ] Implement Role Based Access Control (RBAC) UI for members
- [ ] Wire up API integration
