import { apiClient } from '@/lib/api-client';
import type { HabitDTO, CreateHabitInput, ApiResponse } from '@orbit/shared';

export class HabitsClient {
  static async list(workspaceId: string, projectId: string | undefined): Promise<HabitDTO[]> {
    const params = projectId ? { projectId } : undefined;
    const res = await apiClient<ApiResponse<HabitDTO[]>>(
      `/api/v1/workspaces/${workspaceId}/habits`,
      {
        method: 'GET',
        params,
      },
    );
    return res.data;
  }

  static async getHabit(workspaceId: string, habitId: string): Promise<HabitDTO> {
    const res = await apiClient<ApiResponse<HabitDTO>>(
      `/api/v1/workspaces/${workspaceId}/habits/${habitId}`,
      {
        method: 'GET',
      },
    );
    return res.data;
  }

  static async getHistory(workspaceId: string, habitId: string): Promise<any> {
    const res = await apiClient<ApiResponse<any>>(
      `/api/v1/workspaces/${workspaceId}/habits/${habitId}/history`,
      {
        method: 'GET',
      },
    );
    return res.data;
  }

  static async create(workspaceId: string, data: CreateHabitInput): Promise<HabitDTO> {
    const res = await apiClient<ApiResponse<HabitDTO>>(`/api/v1/workspaces/${workspaceId}/habits`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  }

  static async update(
    workspaceId: string,
    habitId: string,
    data: Partial<CreateHabitInput>,
  ): Promise<HabitDTO> {
    const res = await apiClient<ApiResponse<HabitDTO>>(
      `/api/v1/workspaces/${workspaceId}/habits/${habitId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
    return res.data;
  }

  static async delete(workspaceId: string, habitId: string): Promise<void> {
    await apiClient(`/api/v1/workspaces/${workspaceId}/habits/${habitId}`, {
      method: 'DELETE',
    });
  }

  static async toggleComplete(workspaceId: string, habitId: string): Promise<HabitDTO> {
    const res = await apiClient<ApiResponse<HabitDTO>>(
      `/api/v1/workspaces/${workspaceId}/habits/${habitId}/complete`,
      {
        method: 'POST',
      },
    );
    return res.data;
  }
}
