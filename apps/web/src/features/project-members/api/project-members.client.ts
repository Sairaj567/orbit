import { apiClient } from '@/lib/api-client';
import type { User, WorkspaceMember } from '@orbit/shared';

export interface ProjectMember {
  id: string;
  projectId: string;
  workspaceMemberId: string;
  role: 'VIEWER' | 'EDITOR' | 'OWNER';
  joinedAt: string;
  workspaceMember?: WorkspaceMember & { user?: User };
}

export class ProjectMembersClient {
  static async getMembers(workspaceId: string, projectId: string, token: string): Promise<ProjectMember[]> {
    const data = await apiClient<ProjectMember[]>(
      `/api/v1/workspaces/${workspaceId}/projects/${projectId}/members`,
      { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  }

  static async invite(workspaceId: string, projectId: string, workspaceMemberId: string, role: 'VIEWER' | 'EDITOR' | 'OWNER', token: string): Promise<ProjectMember> {
    const data = await apiClient<ProjectMember>(
      `/api/v1/workspaces/${workspaceId}/projects/${projectId}/members`,
      { 
        method: 'POST', 
        body: JSON.stringify({ workspaceMemberId, role }),
        headers: { Authorization: `Bearer ${token}` } 
      }
    );
    return data;
  }

  static async updateRole(workspaceId: string, projectId: string, memberId: string, role: 'VIEWER' | 'EDITOR' | 'OWNER', token: string): Promise<ProjectMember> {
    const data = await apiClient<ProjectMember>(
      `/api/v1/workspaces/${workspaceId}/projects/${projectId}/members/${memberId}`,
      { 
        method: 'PATCH', 
        body: JSON.stringify({ role }),
        headers: { Authorization: `Bearer ${token}` } 
      }
    );
    return data;
  }

  static async remove(workspaceId: string, projectId: string, memberId: string, token: string): Promise<{ id: string }> {
    const data = await apiClient<{ id: string }>(
      `/api/v1/workspaces/${workspaceId}/projects/${projectId}/members/${memberId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  }
}
