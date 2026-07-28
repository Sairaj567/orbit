import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Activity } from '@orbit/shared';
import { useAuth } from '@/lib/auth-hooks';

interface UseWorkspaceActivityOptions {
  workspaceId: string;
  limit?: number;
}

export function useWorkspaceActivity({ workspaceId, limit = 20 }: UseWorkspaceActivityOptions) {
  const { getToken } = useAuth();
  return useInfiniteQuery({
    queryKey: ['workspaces', workspaceId, 'activity'],
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      const res = await apiClient<{ data: Activity[]; meta?: { nextCursor?: string } }>(
        `/api/v1/workspaces/${workspaceId}/activity`,
        {
          method: 'GET',
          params: {
            limit,
            cursor: pageParam,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return {
        data: res.data,
        nextCursor: res.meta?.nextCursor,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!workspaceId,
  });
}
