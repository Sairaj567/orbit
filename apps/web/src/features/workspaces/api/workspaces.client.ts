import type { ApiResponse, UpdateWorkspaceInput, Workspace, WorkspaceRole } from '@orbit/shared';
import { apiClient } from '@/lib/api-client';

export interface WorkspaceWithRole extends Workspace {
  role: WorkspaceRole;
}

export class WorkspacesClient {
  static async findAll(token?: string): Promise<WorkspaceWithRole[]> {
    const response = await apiClient<ApiResponse<WorkspaceWithRole[]>>('/api/v1/workspaces', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  }

  static async update(
    workspaceId: string,
    payload: UpdateWorkspaceInput,
    token: string,
  ): Promise<WorkspaceWithRole> {
    const response = await apiClient<ApiResponse<WorkspaceWithRole>>(
      `/api/v1/workspaces/${workspaceId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  }
}
