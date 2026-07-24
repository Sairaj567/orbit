import { apiClient } from '@/lib/api-client';
import type { Resource, CreateResourceInput, UpdateResourceInput, ResourceQueryInput } from '@orbit/shared';

export class ResourcesClient {
  static async create(workspaceId: string, data: CreateResourceInput, token: string): Promise<Resource> {
    return apiClient<Resource>(`/api/v1/workspaces/${workspaceId}/resources`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  static async findAll(workspaceId: string, query: Partial<ResourceQueryInput>, token: string): Promise<{ data: Resource[], meta: { total: number, page: number, perPage: number, totalPages: number } }> {
    const params = new URLSearchParams();
    if (query.projectId) params.append('projectId', query.projectId);
    if (query.taskId) params.append('taskId', query.taskId);
    if (query.page) params.append('page', query.page.toString());
    if (query.perPage) params.append('perPage', query.perPage.toString());

    const queryString = params.toString();
    const url = `/api/v1/workspaces/${workspaceId}/resources${queryString ? `?${queryString}` : ''}`;

    return apiClient(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  static async update(workspaceId: string, id: string, data: UpdateResourceInput, token: string): Promise<Resource> {
    return apiClient<Resource>(`/api/v1/workspaces/${workspaceId}/resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  static async remove(workspaceId: string, id: string, token: string): Promise<void> {
    return apiClient<void>(`/api/v1/workspaces/${workspaceId}/resources/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
