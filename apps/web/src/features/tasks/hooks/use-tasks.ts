import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { TasksClient } from '../api/tasks.client';
import type { CreateTaskInput, UpdateTaskInput, TaskQueryInput, Task } from '@orbit/shared';
import type { PaginationMeta } from '../api/tasks.client';

export const taskKeys = {
  all: (workspaceId: string) => ['tasks', workspaceId] as const,
  lists: (workspaceId: string) => [...taskKeys.all(workspaceId), 'list'] as const,
  list: (workspaceId: string, query: Partial<TaskQueryInput>) => [...taskKeys.lists(workspaceId), { query }] as const,
  details: (workspaceId: string) => [...taskKeys.all(workspaceId), 'detail'] as const,
  detail: (workspaceId: string, id: string) => [...taskKeys.details(workspaceId), id] as const,
};

export function useTasks(workspaceId: string, query: Partial<TaskQueryInput> = {}) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: taskKeys.list(workspaceId, query),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return TasksClient.findAll(workspaceId, query, token);
    },
    enabled: !!workspaceId,
  });
}

export function useTask(workspaceId: string, id: string) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: taskKeys.detail(workspaceId, id),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return TasksClient.findOne(workspaceId, id, token);
    },
    enabled: !!workspaceId && !!id,
  });
}

export function useCreateTask(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return TasksClient.create(workspaceId, data, token);
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists(workspaceId) });
      const previousLists = queryClient.getQueriesData({ queryKey: taskKeys.lists(workspaceId) });
      
      queryClient.setQueriesData({ queryKey: taskKeys.lists(workspaceId) }, (old: { data: Task[]; meta: PaginationMeta } | undefined) => {
        if (!old || !old.data) return old;
        const optimisticTask = {
          id: `temp-${Date.now()}`,
          ...newTask,
          status: newTask.status || 'TODO',
          priority: newTask.priority || 'MEDIUM',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          workspaceId,
          tags: newTask.tags || [],
        };
        return {
          ...old,
          data: [optimisticTask, ...old.data],
          meta: { ...old.meta, total: (old.meta?.total || 0) + 1 }
        };
      });
      return { previousLists };
    },
    onError: (_err, _newTask, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists(workspaceId) });
    },
  });
}

export function useUpdateTask(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskInput }) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return TasksClient.update(workspaceId, id, data, token);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(workspaceId, id) });
      await queryClient.cancelQueries({ queryKey: taskKeys.lists(workspaceId) });

      const previousDetail = queryClient.getQueryData(taskKeys.detail(workspaceId, id));
      const previousLists = queryClient.getQueriesData({ queryKey: taskKeys.lists(workspaceId) });

      if (previousDetail) {
        queryClient.setQueryData(taskKeys.detail(workspaceId, id), {
          ...(previousDetail as Task),
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      queryClient.setQueriesData({ queryKey: taskKeys.lists(workspaceId) }, (old: { data: Task[]; meta: PaginationMeta } | undefined) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.map((task: Task) => task.id === id ? { ...task, ...data } : task)
        };
      });

      return { previousDetail, previousLists };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(taskKeys.detail(workspaceId, _variables.id), context.previousDetail);
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(workspaceId, variables.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists(workspaceId) });
    },
  });
}

export function useDeleteTask(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return TasksClient.remove(workspaceId, id, token);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(workspaceId, id) });
      await queryClient.cancelQueries({ queryKey: taskKeys.lists(workspaceId) });

      const previousLists = queryClient.getQueriesData({ queryKey: taskKeys.lists(workspaceId) });

      queryClient.setQueriesData({ queryKey: taskKeys.lists(workspaceId) }, (old: { data: Task[]; meta: PaginationMeta } | undefined) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.filter((task: Task) => task.id !== id),
          meta: { ...old.meta, total: Math.max(0, (old.meta?.total || 0) - 1) }
        };
      });

      return { previousLists };
    },
    onError: (_err, _id, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (_, __, id) => {
      queryClient.removeQueries({ queryKey: taskKeys.detail(workspaceId, id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists(workspaceId) });
    },
  });
}
