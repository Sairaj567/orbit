import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ResourcesClient } from '../api/resources.client';
import type { CreateResourceInput, ResourceQueryInput } from '@orbit/shared';
import { queryKeys } from '@/lib/query-keys';
import { useRealtime } from '@/providers/realtime-provider';
import { useEffect } from 'react';

export function useResources(workspaceId: string, query: Partial<ResourceQueryInput> = {}) {
  const { subscribe } = useRealtime();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubCreated = subscribe('resource.created', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.all(workspaceId) });
    });
    const unsubUpdated = subscribe('resource.updated', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.all(workspaceId) });
    });
    const unsubDeleted = subscribe('resource.deleted', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.all(workspaceId) });
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [workspaceId, subscribe, queryClient]);

  return useQuery({
    queryKey: queryKeys.resources.list(workspaceId, query),
    queryFn: async () => {
      return ResourcesClient.findAll(workspaceId, query);
    },
    enabled: !!workspaceId,
  });
}

export function useCreateResource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateResourceInput) => {
      return ResourcesClient.create(workspaceId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.all(workspaceId) });
    },
  });
}

export function useDeleteResource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return ResourcesClient.remove(workspaceId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.all(workspaceId) });
    },
  });
}

export function useUpdateResource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: import('@orbit/shared').UpdateResourceInput;
    }) => {
      return ResourcesClient.update(workspaceId, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.resources.all(workspaceId) });
    },
  });
}
