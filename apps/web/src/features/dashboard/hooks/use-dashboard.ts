import { useQuery } from '@tanstack/react-query';
import { dashboardClient } from '../api/dashboard.client';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { queryKeys } from '@/lib/query-keys';

export function useDashboard(workspaceIdParam?: string) {
  const { workspace } = useWorkspaceContext();
  const workspaceSlug = workspaceIdParam || workspace?.slug;

  return useQuery({
    queryKey: queryKeys.dashboard.all(workspaceSlug ?? ''),
    queryFn: async () => {
      return dashboardClient.getDashboardData(workspaceSlug!);
    },
    enabled: !!workspaceSlug,
  });
}
