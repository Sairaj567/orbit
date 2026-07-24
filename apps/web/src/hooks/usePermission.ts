import type { WorkspaceRole } from '@orbit/shared';
import { canAccess } from '@/lib/permissions';

export function usePermission(userRole: WorkspaceRole = 'OWNER') {
  return (action: string, requiredRole?: WorkspaceRole) => canAccess(requiredRole, userRole) && Boolean(action);
}