import type { DashboardResponse } from '@orbit/shared';
import { apiClient } from '@/lib/api-client';

export const dashboardClient = {
  getDashboardData: async (workspaceId: string): Promise<DashboardResponse> => {
    return apiClient<DashboardResponse>(`/workspaces/${workspaceId}/dashboard`);
  },
};
