import { apiClient } from '@/lib/api-client';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryInput,
  ApiResponse,
  PaginatedResponse,
  ApiMeta,
} from '@orbit/shared';

export type PaginationMeta = ApiMeta;

export class TasksClient {
  static async create(workspaceId: string, data: CreateTaskInput): Promise<Task> {
    const res = await apiClient<ApiResponse<Task>>(`/api/v1/workspaces/${workspaceId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  }

  static async findAll(
    workspaceId: string,
    query: Partial<TaskQueryInput>,
  ): Promise<PaginatedResponse<Task>> {
    return apiClient<PaginatedResponse<Task>>(`/api/v1/workspaces/${workspaceId}/tasks`, {
      method: 'GET',
      params: query as Record<string, string | number | boolean | string[] | number[] | undefined>,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static async findOne(workspaceId: string, id: string): Promise<Task> {
    const res = await apiClient<ApiResponse<Task>>(
      `/api/v1/workspaces/${workspaceId}/tasks/${id}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  }

  static async update(workspaceId: string, id: string, data: UpdateTaskInput): Promise<Task> {
    const res = await apiClient<ApiResponse<Task>>(
      `/api/v1/workspaces/${workspaceId}/tasks/${id}`,
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
    await apiClient(`/api/v1/workspaces/${workspaceId}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
