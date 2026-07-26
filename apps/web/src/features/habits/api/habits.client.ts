import { apiClient } from '@/lib/api-client';
import type { HabitDTO, CreateHabitInput, ApiResponse } from '@orbit/shared';

export class HabitsClient {
  static async list(
    workspaceId: string,
    projectId: string | undefined,
    token: string,
  ): Promise<HabitDTO[]> {
    const params = projectId ? { projectId } : undefined;
    const res = await apiClient<ApiResponse<HabitDTO[]>>(
      `/api/v1/workspaces/${workspaceId}/habits`,
      {
        method: 'GET',
        params,
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }

  static async getHabit(workspaceId: string, habitId: string, token: string): Promise<HabitDTO> {
    const res = await apiClient<ApiResponse<HabitDTO>>(
      `/api/v1/workspaces/${workspaceId}/habits/${habitId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }

  static async create(
    workspaceId: string,
    data: CreateHabitInput,
    token: string,
  ): Promise<HabitDTO> {
    const res = await apiClient<ApiResponse<HabitDTO>>(`/api/v1/workspaces/${workspaceId}/habits`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  static async update(
    workspaceId: string,
    habitId: string,
    data: Partial<CreateHabitInput>,
    token: string,
  ): Promise<HabitDTO> {
    const res = await apiClient<ApiResponse<HabitDTO>>(
      `/api/v1/workspaces/${workspaceId}/habits/${habitId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }

  static async delete(workspaceId: string, habitId: string, token: string): Promise<void> {
    await apiClient(`/api/v1/workspaces/${workspaceId}/habits/${habitId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  static async toggleComplete(
    workspaceId: string,
    habitId: string,
    token: string,
  ): Promise<HabitDTO> {
    const res = await apiClient<ApiResponse<HabitDTO>>(
      `/api/v1/workspaces/${workspaceId}/habits/${habitId}/complete`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }
}
