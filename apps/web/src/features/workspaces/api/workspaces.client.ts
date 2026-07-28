import type { ApiResponse, UpdateWorkspaceInput, Workspace, WorkspaceRole } from '@orbit/shared';
import { apiClient } from '@/lib/api-client';

export interface WorkspaceWithRole extends Workspace {
  role: WorkspaceRole;
}

export class WorkspacesClient {
  static async findAll(): Promise<WorkspaceWithRole[]> {
    const response = await apiClient<ApiResponse<WorkspaceWithRole[]>>('/api/v1/workspaces');
    return response.data;
  }

  static async create(payload: {
    name: string;
    slug: string;
    description?: string;
  }): Promise<WorkspaceWithRole> {
    const response = await apiClient<ApiResponse<WorkspaceWithRole>>('/api/v1/workspaces', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  }

  static async update(
    workspaceId: string,
    payload: UpdateWorkspaceInput,
  ): Promise<WorkspaceWithRole> {
    const response = await apiClient<ApiResponse<WorkspaceWithRole>>(
      `/api/v1/workspaces/${workspaceId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
    return response.data;
  }
}
