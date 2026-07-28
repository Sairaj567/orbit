import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TasksClient } from '../api/tasks.client';
import type { CreateTaskInput, UpdateTaskInput, TaskQueryInput, Task } from '@orbit/shared';
import type { PaginationMeta } from '../api/tasks.client';
import { queryKeys } from '@/lib/query-keys';
import { useRealtime } from '@/providers/realtime-provider';
import { useEffect } from 'react';

export function useTasks(workspaceId: string, query: Partial<TaskQueryInput> = {}) {
  const { subscribe } = useRealtime();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubCreated = subscribe('task.created', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all(workspaceId) });
    });
    const unsubUpdated = subscribe('task.updated', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all(workspaceId) });
    });
    const unsubDeleted = subscribe('task.deleted', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all(workspaceId) });
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [workspaceId, subscribe, queryClient]);

  return useQuery({
    queryKey: queryKeys.tasks.list(workspaceId, query),
    queryFn: async () => {
      return TasksClient.findAll(workspaceId, query);
    },
    enabled: !!workspaceId,
  });
}

export function useTask(workspaceId: string, id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(workspaceId, id),
    queryFn: async () => {
      return TasksClient.findOne(workspaceId, id);
    },
    enabled: !!workspaceId && !!id,
  });
}

export function useCreateTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      return TasksClient.create(workspaceId, data);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all(workspaceId) });

      // Basic optimistic update if needed could be added here
      // Realtime events will also handle the final update
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(workspaceId) });
    },
  });
}

export function useUpdateTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskInput }) => {
      return TasksClient.update(workspaceId, id, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(workspaceId, id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all(workspaceId) });

      const previousDetail = queryClient.getQueryData(queryKeys.tasks.detail(workspaceId, id));

      if (previousDetail) {
        queryClient.setQueryData(queryKeys.tasks.detail(workspaceId, id), {
          ...(previousDetail as Task),
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousDetail };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.tasks.detail(workspaceId, _variables.id),
          context.previousDetail,
        );
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(workspaceId, variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(workspaceId) });
    },
  });
}

export function useDeleteTask(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return TasksClient.remove(workspaceId, id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(workspaceId, id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all(workspaceId) });
    },
    onSettled: (_, __, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.tasks.detail(workspaceId, id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(workspaceId) });
    },
  });
}
