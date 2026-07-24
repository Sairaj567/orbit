import type { WorkspaceRole } from '@orbit/shared';

const ROLE_WEIGHT: Record<WorkspaceRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export function canAccess(requiredRole: WorkspaceRole | undefined, userRole: WorkspaceRole): boolean {
  if (!requiredRole) {
    return true;
  }

  return ROLE_WEIGHT[userRole] >= ROLE_WEIGHT[requiredRole];
}