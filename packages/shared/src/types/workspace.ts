import type { WorkspaceRole } from './enums.js';
import type { User } from './user.js';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  role: WorkspaceRole;
  joinedAt: string;
  nickname: string | null;
  status: string;
  email: string | null;
  userId: string | null;
  workspaceId: string;
  user?: User;
}
