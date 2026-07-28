import { apiClient } from '@/lib/api-client';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryInput,
  ApiResponse,
  PaginatedResponse,
  ApiMeta,
} from '@orbit/shared';

export type PaginationMeta = ApiMeta;

export class ProjectsClient {
  static async create(workspaceId: string, data: CreateProjectInput): Promise<Project> {
    const res = await apiClient<ApiResponse<Project>>(
      `/api/v1/workspaces/${workspaceId}/projects`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  }

  static async findAll(
    workspaceId: string,
    query: Partial<ProjectQueryInput>,
  ): Promise<PaginatedResponse<Project>> {
    return apiClient<PaginatedResponse<Project>>(`/api/v1/workspaces/${workspaceId}/projects`, {
      method: 'GET',
      params: query as Record<string, string | number | boolean | string[] | number[] | undefined>,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static async findOne(workspaceId: string, id: string): Promise<Project> {
    const res = await apiClient<ApiResponse<Project>>(
      `/api/v1/workspaces/${workspaceId}/projects/${id}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  }

  static async update(workspaceId: string, id: string, data: UpdateProjectInput): Promise<Project> {
    const res = await apiClient<ApiResponse<Project>>(
      `/api/v1/workspaces/${workspaceId}/projects/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  }

  static async remove(workspaceId: string, id: string): Promise<void> {
    await apiClient(`/api/v1/workspaces/${workspaceId}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
