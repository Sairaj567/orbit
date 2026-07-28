import type { Request } from 'express';

export interface RequestUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  timezone: string;
}

export interface SessionAuthContext {
  sessionId: string;
}

export interface WorkspaceMembershipContext {
  id: string;
  userId?: string | null;
  workspaceId: string;
  role: any;
  nickname?: string | null;
}

export interface AuthenticatedRequest extends Request {
  auth?: SessionAuthContext;
  user?: RequestUser;
  workspace?: { id: string; slug: string; name: string };
  workspaceId?: string;
  workspaceMembership?: WorkspaceMembershipContext;
}
