import { User } from './user';
import { Workspace } from './workspace';
import { Project } from './project';

export type ActivityEntityType =
  | 'TASK'
  | 'PROJECT'
  | 'NOTE'
  | 'RESOURCE'
  | 'MEMBER'
  | 'WORKSPACE'
  | 'HABIT'
  | 'STUDY_BLOCK';

export type ActivityAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'COMPLETED'
  | 'ASSIGNED'
  | 'INVITED'
  | 'JOINED'
  | 'REMOVED'
  | 'UNCOMPLETED';

export interface Activity {
  id: string;
  workspaceId: string;
  projectId: string | null;
  userId: string;
  actorName: string | null;
  entityType: ActivityEntityType | string;
  entityId: string;
  action: ActivityAction | string;
  metadata: any | null; // Using any for Json fallback
  createdAt: string; // ISO string

  workspace?: Workspace;
  project?: Project;
  user?: User;
}

export interface GetActivityQueryDto {
  projectId?: string;
  entityType?: ActivityEntityType;
  action?: ActivityAction;
  cursor?: string;
  limit?: number;
}
