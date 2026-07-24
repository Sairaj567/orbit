import { useQuery } from '@tanstack/react-query';
import { dashboardClient } from '../api/dashboard.client';
import { useWorkspaceStore } from '@/stores/workspace.store';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  workspace: (workspaceId: string) => [...dashboardKeys.all, workspaceId] as const,
};

export function useDashboard() {
  const { currentWorkspaceId } = useWorkspaceStore();

  return useQuery({
    queryKey: dashboardKeys.workspace(currentWorkspaceId!),
    queryFn: () => dashboardClient.getDashboardData(currentWorkspaceId!),
    enabled: !!currentWorkspaceId,
  });
}
