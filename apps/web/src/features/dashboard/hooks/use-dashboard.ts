import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-hooks';
import { dashboardClient } from '../api/dashboard.client';
import { useWorkspaceContext } from '@/components/layout/workspace-context';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  workspace: (workspaceId: string) => [...dashboardKeys.all, workspaceId] as const,
};

export function useDashboard(workspaceIdParam?: string) {
  const { getToken } = useAuth();
  const { workspace } = useWorkspaceContext();
  const workspaceSlug = workspaceIdParam || workspace?.slug;

  return useQuery({
    queryKey: dashboardKeys.workspace(workspaceSlug ?? ''),
    queryFn: async () => {
      const token = await getToken();
      return dashboardClient.getDashboardData(workspaceSlug!, token ?? undefined);
    },
    enabled: !!workspaceSlug,
  });
}
