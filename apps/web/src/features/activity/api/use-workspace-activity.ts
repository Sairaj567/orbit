import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Activity } from '@orbit/shared';

interface UseWorkspaceActivityOptions {
  workspaceId: string;
  limit?: number;
}

export function useWorkspaceActivity({ workspaceId, limit = 20 }: UseWorkspaceActivityOptions) {
  return useInfiniteQuery({
    queryKey: queryKeys.workspaces.activity(workspaceId),
    queryFn: async ({ pageParam }) => {
      const res = await apiClient<{ data: Activity[]; meta?: { nextCursor?: string } }>(
        `/api/v1/workspaces/${workspaceId}/activity`,
        {
          method: 'GET',
          params: {
            limit,
            cursor: pageParam,
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
