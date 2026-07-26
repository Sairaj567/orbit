import type { DashboardResponse, ApiResponse } from '@orbit/shared';
import { apiClient } from '@/lib/api-client';

export const dashboardClient = {
  getDashboardData: async (workspaceId: string, token?: string): Promise<DashboardResponse> => {
    const response = await apiClient<ApiResponse<DashboardResponse>>(
      `/api/v1/workspaces/${workspaceId}/dashboard`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    return response.data;
  },
};
