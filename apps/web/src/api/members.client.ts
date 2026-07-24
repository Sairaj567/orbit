import type { WorkspaceMember, WorkspaceRole, ApiResponse } from '@orbit/shared';
import { apiClient } from '@/lib/api-client';

export class MembersClient {
  static async findAll(workspaceId: string, token: string): Promise<WorkspaceMember[]> {
    const response = await apiClient<ApiResponse<WorkspaceMember[]>>(
      `/api/v1/workspaces/${workspaceId}/members`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }

  static async invite(
    workspaceId: string,
    payload: { email: string; role: WorkspaceRole },
    token: string
  ): Promise<WorkspaceMember> {
    const response = await apiClient<ApiResponse<WorkspaceMember>>(
      `/api/v1/workspaces/${workspaceId}/members`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }

  static async updateRole(
    workspaceId: string,
    memberId: string,
    payload: { role: WorkspaceRole },
    token: string
  ): Promise<WorkspaceMember> {
    const response = await apiClient<ApiResponse<WorkspaceMember>>(
      `/api/v1/workspaces/${workspaceId}/members/${memberId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  }

  static async remove(workspaceId: string, memberId: string, token: string): Promise<void> {
    await apiClient(
      `/api/v1/workspaces/${workspaceId}/members/${memberId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  }
}
