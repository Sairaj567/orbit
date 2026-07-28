import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudyBlocksClient } from '../api/study-blocks.client';
import { useWorkspaceStore } from '@/stores';
import type {
  CreateStudyBlockInput,
  UpdateStudyBlockInput,
  CompleteStudyBlockInput,
} from '@orbit/shared';
import { queryKeys } from '@/lib/query-keys';
import { useRealtime } from '@/providers/realtime-provider';
import { useEffect } from 'react';

export function useActiveStudyBlock() {
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);
  const { subscribe } = useRealtime();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentWorkspaceId) return;

    const unsubCreated = subscribe('studyBlock.created', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studyBlocks.active(currentWorkspaceId) });
    });
    const unsubUpdated = subscribe('studyBlock.updated', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studyBlocks.active(currentWorkspaceId) });
    });
    const unsubDeleted = subscribe('studyBlock.deleted', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studyBlocks.active(currentWorkspaceId) });
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [currentWorkspaceId, subscribe, queryClient]);

  return useQuery({
    queryKey: currentWorkspaceId ? queryKeys.studyBlocks.active(currentWorkspaceId) : [],
    queryFn: async () => {
      if (!currentWorkspaceId) return null;
      return StudyBlocksClient.getActive(currentWorkspaceId);
    },
    enabled: !!currentWorkspaceId,
  });
}

export function useStudyBlocksHistory() {
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

  return useQuery({
    queryKey: currentWorkspaceId ? ['studyBlocks', 'history', currentWorkspaceId] : [],
    queryFn: async () => {
      if (!currentWorkspaceId) return [];
      return StudyBlocksClient.getHistory(currentWorkspaceId);
    },
    enabled: !!currentWorkspaceId,
  });
}

export function useCreateStudyBlock() {
  const queryClient = useQueryClient();
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

  return useMutation({
    mutationFn: async (data: CreateStudyBlockInput) => {
      if (!currentWorkspaceId) throw new Error('No workspace selected');
      return StudyBlocksClient.create(currentWorkspaceId, data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.studyBlocks.active(currentWorkspaceId!), data);
    },
  });
}

export function useUpdateStudyBlock() {
  const queryClient = useQueryClient();
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateStudyBlockInput }) => {
      if (!currentWorkspaceId) throw new Error('No workspace selected');
      return StudyBlocksClient.update(currentWorkspaceId, id, data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.studyBlocks.active(currentWorkspaceId!), data);
    },
  });
}

export function useCompleteStudyBlock() {
  const queryClient = useQueryClient();
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CompleteStudyBlockInput }) => {
      if (!currentWorkspaceId) throw new Error('No workspace selected');
      return StudyBlocksClient.complete(currentWorkspaceId, id, data);
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.studyBlocks.active(currentWorkspaceId!), null);
    },
  });
}

export function useCancelStudyBlock() {
  const queryClient = useQueryClient();
  const currentWorkspaceId = useWorkspaceStore((state) => state.currentWorkspaceId);

  return useMutation({
    mutationFn: async (id: string) => {
      if (!currentWorkspaceId) throw new Error('No workspace selected');
      return StudyBlocksClient.cancel(currentWorkspaceId, id);
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.studyBlocks.active(currentWorkspaceId!), null);
    },
  });
}
