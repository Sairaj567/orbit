import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { StudyBlocksClient } from '../api/study-blocks.client';
import { useWorkspaceStore } from '@/stores';
import type { CreateStudyBlockInput, UpdateStudyBlockInput, CompleteStudyBlockInput } from '@orbit/shared';

const QUERY_KEY = ['study-blocks', 'active'];

export function useActiveStudyBlock() {
  const { getToken } = useAuth();
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

  return useQuery({
    queryKey: [...QUERY_KEY, currentWorkspaceId],
    queryFn: async () => {
      if (!currentWorkspaceId) return null;
      const token = await getToken();
      if (!token) return null;
      return StudyBlocksClient.getActive(currentWorkspaceId, token);
    },
    enabled: !!currentWorkspaceId,
  });
}

export function useCreateStudyBlock() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

  return useMutation({
    mutationFn: async (data: CreateStudyBlockInput) => {
      if (!currentWorkspaceId) throw new Error('No workspace selected');
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return StudyBlocksClient.create(currentWorkspaceId, data, token);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([...QUERY_KEY, currentWorkspaceId], data);
    },
  });
}

export function useUpdateStudyBlock() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStudyBlockInput }) => {
      if (!currentWorkspaceId) throw new Error('No workspace selected');
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return StudyBlocksClient.update(currentWorkspaceId, id, data, token);
    },
    onSuccess: (data) => {
      queryClient.setQueryData([...QUERY_KEY, currentWorkspaceId], data);
    },
  });
}

export function useCompleteStudyBlock() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CompleteStudyBlockInput }) => {
      if (!currentWorkspaceId) throw new Error('No workspace selected');
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return StudyBlocksClient.complete(currentWorkspaceId, id, data, token);
    },
    onSuccess: () => {
      queryClient.setQueryData([...QUERY_KEY, currentWorkspaceId], null);
    },
  });
}

export function useCancelStudyBlock() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

  return useMutation({
    mutationFn: async (id: string) => {
      if (!currentWorkspaceId) throw new Error('No workspace selected');
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return StudyBlocksClient.cancel(currentWorkspaceId, id, token);
    },
    onSuccess: () => {
      queryClient.setQueryData([...QUERY_KEY, currentWorkspaceId], null);
    },
  });
}
