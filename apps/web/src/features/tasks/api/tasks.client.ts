import { apiClient } from '@/lib/api-client';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '@orbit/shared';

export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export class TasksClient {
  static async create(workspaceId: string, data: CreateTaskInput, token: string): Promise<Task> {
    return apiClient<Task>(`/api/v1/workspaces/${workspaceId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  static async findAll(workspaceId: string, query: Partial<TaskQueryInput>, token: string): Promise<{ data: Task[], meta: PaginationMeta }> {
    return apiClient<{ data: Task[], meta: PaginationMeta }>(`/api/v1/workspaces/${workspaceId}/tasks`, {
      method: 'GET',
      params: query as Record<string, string | number | boolean | string[] | number[] | undefined>,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  static async findOne(workspaceId: string, id: string, token: string): Promise<Task> {
    return apiClient<Task>(`/api/v1/workspaces/${workspaceId}/tasks/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  static async update(workspaceId: string, id: string, data: UpdateTaskInput, token: string): Promise<Task> {
    return apiClient<Task>(`/api/v1/workspaces/${workspaceId}/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  static async remove(workspaceId: string, id: string, token: string): Promise<void> {
    return apiClient<void>(`/api/v1/workspaces/${workspaceId}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
