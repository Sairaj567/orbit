import type { WorkspaceRole } from '@prisma/client';
import type { Request } from 'express';

export interface RequestUser {
  id: string;
  clerkId: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  timezone: string;
}

export interface ClerkAuthContext {
  clerkId: string;
  sessionId?: string;
  tokenType?: string;
}

export interface WorkspaceMembershipContext {
  id: string;
  userId?: string | null;
  workspaceId: string;
  role: WorkspaceRole;
  nickname?: string | null;
}

export interface AuthenticatedRequest extends Request {
  auth?: ClerkAuthContext;
  user?: RequestUser;
  workspaceMembership?: WorkspaceMembershipContext;
}
