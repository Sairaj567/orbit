import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { HabitsClient } from '../api/habits.client';
import type { HabitDTO, CreateHabitInput } from '@orbit/shared';

export function useHabits(workspaceId: string, projectId?: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'habits', { projectId }],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return HabitsClient.list(workspaceId, projectId, token);
    },
    enabled: !!workspaceId,
  });
}

export function useHabit(workspaceId: string, id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['workspaces', workspaceId, 'habits', id],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return HabitsClient.getHabit(workspaceId, id, token);
    },
    enabled: !!workspaceId && !!id,
  });
}

export function useCreateHabit(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateHabitInput) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return HabitsClient.create(workspaceId, { ...data, projectId } as CreateHabitInput & { projectId: string }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'habits'] });
    },
  });
}

export function useUpdateHabit(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateHabitInput> }) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return HabitsClient.update(workspaceId, id, data, token);
    },
    onSuccess: (updatedHabit) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'habits'] });
      queryClient.setQueryData(['workspaces', workspaceId, 'habits', updatedHabit.id], updatedHabit);
    },
  });
}

export function useDeleteHabit(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return HabitsClient.delete(workspaceId, id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'habits'] });
    },
  });
}

export function useToggleHabitComplete(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return HabitsClient.toggleComplete(workspaceId, id, token);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['workspaces', workspaceId, 'habits'] });

      // Basic optimistic update for the list
      const previousHabits = queryClient.getQueryData<HabitDTO[]>(['workspaces', workspaceId, 'habits', { projectId: undefined }]);
      
      // We could do precise optimistic updates here, but invalidation is safer for complex streak logic
      
      return { previousHabits };
    },
    onSuccess: (updatedHabit) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'habits'] });
      queryClient.setQueryData(['workspaces', workspaceId, 'habits', updatedHabit.id], updatedHabit);
    },
    onError: (_err, _newHabit, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(['workspaces', workspaceId, 'habits', { projectId: undefined }], context.previousHabits);
      }
    },
  });
}
