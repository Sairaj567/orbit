import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HabitsClient } from '../api/habits.client';
import type { HabitDTO, CreateHabitInput, UpdateHabitInput } from '@orbit/shared';
import { queryKeys } from '@/lib/query-keys';
import { useRealtime } from '@/providers/realtime-provider';
import { useEffect } from 'react';

export function useHabits(workspaceId: string, projectId?: string) {
  const { subscribe } = useRealtime();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubCreated = subscribe('habit.created', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(workspaceId) });
    });
    const unsubUpdated = subscribe('habit.updated', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(workspaceId) });
    });
    const unsubDeleted = subscribe('habit.deleted', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(workspaceId) });
    });
    const unsubCompleted = subscribe('habit.completed', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(workspaceId) });
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
      unsubCompleted();
    };
  }, [workspaceId, subscribe, queryClient]);

  return useQuery({
    queryKey: queryKeys.habits.list(workspaceId, { projectId }),
    queryFn: async () => {
      return HabitsClient.list(workspaceId, projectId);
    },
    enabled: !!workspaceId,
  });
}

export function useHabit(workspaceId: string, id: string) {
  return useQuery({
    queryKey: queryKeys.habits.detail(workspaceId, id),
    queryFn: async () => {
      return HabitsClient.getHabit(workspaceId, id);
    },
    enabled: !!workspaceId && !!id,
  });
}

export function useCreateHabit(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateHabitInput) => {
      return HabitsClient.create(workspaceId, { ...data, projectId } as CreateHabitInput & {
        projectId: string;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(workspaceId) });
    },
  });
}

export function useUpdateHabit(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateHabitInput }) => {
      return HabitsClient.update(workspaceId, id, data);
    },
    onSuccess: (updatedHabit) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(workspaceId) });
      queryClient.setQueryData(queryKeys.habits.detail(workspaceId, updatedHabit.id), updatedHabit);
    },
  });
}

export function useDeleteHabit(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return HabitsClient.delete(workspaceId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(workspaceId) });
    },
  });
}

export function useToggleHabitComplete(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return HabitsClient.toggleComplete(workspaceId, id);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.all(workspaceId) });

      const previousHabits = queryClient.getQueryData<HabitDTO[]>(
        queryKeys.habits.list(workspaceId, { projectId: undefined }),
      );

      return { previousHabits };
    },
    onSuccess: (updatedHabit) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(workspaceId) });
      queryClient.setQueryData(queryKeys.habits.detail(workspaceId, updatedHabit.id), updatedHabit);
    },
    onError: (_err, _newHabit, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(
          queryKeys.habits.list(workspaceId, { projectId: undefined }),
          context.previousHabits,
        );
      }
    },
  });
}
