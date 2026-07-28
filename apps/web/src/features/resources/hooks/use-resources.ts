import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-hooks';
import { ResourcesClient } from '../api/resources.client';
import type { CreateResourceInput, ResourceQueryInput } from '@orbit/shared';
import { useQuery } from '@tanstack/react-query';

export const resourceKeys = {
  all: (workspaceId: string) => ['resources', workspaceId] as const,
  lists: (workspaceId: string) => [...resourceKeys.all(workspaceId), 'list'] as const,
  list: (workspaceId: string, query: Partial<ResourceQueryInput>) =>
    [...resourceKeys.lists(workspaceId), { query }] as const,
};

export function useResources(workspaceId: string, query: Partial<ResourceQueryInput> = {}) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: resourceKeys.list(workspaceId, query),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return ResourcesClient.findAll(workspaceId, query, token);
    },
    enabled: !!workspaceId,
  });
}

export function useCreateResource(workspaceId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateResourceInput) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return ResourcesClient.create(workspaceId, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists(workspaceId) });
    },
  });
}

export function useDeleteResource(workspaceId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return ResourcesClient.remove(workspaceId, id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists(workspaceId) });
    },
  });
}
