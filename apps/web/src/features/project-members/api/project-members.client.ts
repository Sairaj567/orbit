import { apiClient } from '@/lib/api-client';
import type { User, WorkspaceMember, ApiResponse } from '@orbit/shared';

export interface ProjectMember {
  id: string;
  projectId: string;
  workspaceMemberId: string;
  role: 'VIEWER' | 'EDITOR' | 'OWNER';
  joinedAt: string;
  workspaceMember?: WorkspaceMember & { user?: User };
}

export class ProjectMembersClient {
  static async getMembers(workspaceId: string, projectId: string): Promise<ProjectMember[]> {
    const res = await apiClient<ApiResponse<ProjectMember[]>>(
      `/api/v1/workspaces/${workspaceId}/projects/${projectId}/members`,
      { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data;
  }

  static async invite(
    workspaceId: string,
    projectId: string,
    workspaceMemberId: string,
    role: 'VIEWER' | 'EDITOR' | 'OWNER',
  ): Promise<ProjectMember> {
    const res = await apiClient<ApiResponse<ProjectMember>>(
      `/api/v1/workspaces/${workspaceId}/projects/${projectId}/members`,
      {
        method: 'POST',
        body: JSON.stringify({ workspaceMemberId, role }),
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }

  static async updateRole(
    workspaceId: string,
    projectId: string,
    memberId: string,
    role: 'VIEWER' | 'EDITOR' | 'OWNER',
  ): Promise<ProjectMember> {
    const res = await apiClient<ApiResponse<ProjectMember>>(
      `/api/v1/workspaces/${workspaceId}/projects/${projectId}/members/${memberId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ role }),
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }

  static async remove(
    workspaceId: string,
    projectId: string,
    memberId: string,
  ): Promise<{ id: string }> {
    const res = await apiClient<ApiResponse<{ id: string }>>(
      `/api/v1/workspaces/${workspaceId}/projects/${projectId}/members/${memberId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data;
  }
}
