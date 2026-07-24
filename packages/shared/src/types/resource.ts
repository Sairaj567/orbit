import type { ResourceType } from './enums.js';

export interface Resource {
  id: string;
  workspaceId: string;
  title: string;
  url: string | null;
  type: ResourceType;
  metadata: Record<string, any> | null;
  projectId: string | null;
  taskId: string | null;
  aiSummary?: string | null;
  createdAt: string;
  updatedAt: string;
}
