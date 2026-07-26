import { apiClient } from '@/lib/api-client';
import type {
  Resource,
  CreateResourceInput,
  UpdateResourceInput,
  ResourceQueryInput,
  ApiResponse,
  PaginatedResponse,
} from '@orbit/shared';

export class ResourcesClient {
  static async create(
    workspaceId: string,
    data: CreateResourceInput,
    token: string,
  ): Promise<Resource> {
    const res = await apiClient<ApiResponse<Resource>>(
      `/api/v1/workspaces/${workspaceId}/resources`,
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
    query: Partial<ResourceQueryInput>,
    token: string,
  ): Promise<PaginatedResponse<Resource>> {
    return apiClient<PaginatedResponse<Resource>>(`/api/v1/workspaces/${workspaceId}/resources`, {
      method: 'GET',
      params: query as Record<string, string | number | boolean | string[] | number[] | undefined>,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static async update(
    workspaceId: string,
    id: string,
    data: UpdateResourceInput,
    token: string,
  ): Promise<Resource> {
    const res = await apiClient<ApiResponse<Resource>>(
      `/api/v1/workspaces/${workspaceId}/resources/${id}`,
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

  static async remove(workspaceId: string, id: string, token: string): Promise<void> {
    await apiClient(`/api/v1/workspaces/${workspaceId}/resources/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
