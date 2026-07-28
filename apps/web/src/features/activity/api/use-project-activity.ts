import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Activity } from '@orbit/shared';

interface UseProjectActivityOptions {
  workspaceId: string;
  projectId: string;
  limit?: number;
}

export function useProjectActivity({
  workspaceId,
  projectId,
  limit = 20,
}: UseProjectActivityOptions) {
  return useInfiniteQuery({
    queryKey: queryKeys.projects.activity(workspaceId, projectId),
    queryFn: async ({ pageParam }) => {
      const res = await apiClient<{ data: Activity[]; meta?: { nextCursor?: string } }>(
        `/api/v1/workspaces/${workspaceId}/projects/${projectId}/activity`,
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
    enabled: !!workspaceId && !!projectId,
  });
}
