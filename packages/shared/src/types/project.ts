import type { ProjectStatus, Visibility, Role } from './enums.js';

export interface Project {
  id: string;
  workspaceId: string;
  creatorId: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  coverImage: string | null;
  status: ProjectStatus;
  visibility: Visibility;
  isArchived: boolean;
  progress: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: Role;
  joinedAt: string;
}
