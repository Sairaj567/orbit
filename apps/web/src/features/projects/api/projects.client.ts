import { apiClient } from '@/lib/api-client';
import type { Project, CreateProjectInput, UpdateProjectInput, ProjectQueryInput } from '@orbit/shared';

export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export class ProjectsClient {
  static async create(workspaceId: string, data: CreateProjectInput, token: string): Promise<Project> {
    return apiClient<Project>(`/api/v1/workspaces/${workspaceId}/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  static async findAll(workspaceId: string, query: Partial<ProjectQueryInput>, token: string): Promise<{ data: Project[], meta: PaginationMeta }> {
    return apiClient<{ data: Project[], meta: PaginationMeta }>(`/api/v1/workspaces/${workspaceId}/projects`, {
      method: 'GET',
      params: query as Record<string, string | number | boolean | string[] | number[] | undefined>,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  static async findOne(workspaceId: string, id: string, token: string): Promise<Project> {
    return apiClient<Project>(`/api/v1/workspaces/${workspaceId}/projects/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  static async update(workspaceId: string, id: string, data: UpdateProjectInput, token: string): Promise<Project> {
    return apiClient<Project>(`/api/v1/workspaces/${workspaceId}/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  static async remove(workspaceId: string, id: string, token: string): Promise<void> {
    return apiClient<void>(`/api/v1/workspaces/${workspaceId}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
