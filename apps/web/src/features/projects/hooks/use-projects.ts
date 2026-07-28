import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectsClient } from '../api/projects.client';
import type { CreateProjectInput, UpdateProjectInput, ProjectQueryInput } from '@orbit/shared';
import { queryKeys } from '@/lib/query-keys';
import { useRealtime } from '@/providers/realtime-provider';
import { useEffect } from 'react';

export function useProjects(workspaceId: string, query: Partial<ProjectQueryInput> = {}) {
  const { subscribe } = useRealtime();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubCreated = subscribe('project.created', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all(workspaceId) });
    });
    const unsubUpdated = subscribe('project.updated', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all(workspaceId) });
    });
    const unsubDeleted = subscribe('project.deleted', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(workspaceId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all(workspaceId) });
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [workspaceId, subscribe, queryClient]);

  return useQuery({
    queryKey: queryKeys.projects.list(workspaceId, query),
    queryFn: async () => {
      return ProjectsClient.findAll(workspaceId, query);
    },
    enabled: !!workspaceId,
  });
}

export function useProject(workspaceId: string, id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(workspaceId, id),
    queryFn: async () => {
      return ProjectsClient.findOne(workspaceId, id);
    },
    enabled: !!workspaceId && !!id,
  });
}

export function useCreateProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      return ProjectsClient.create(workspaceId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(workspaceId) });
    },
  });
}

export function useUpdateProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectInput }) => {
      return ProjectsClient.update(workspaceId, id, data);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.all(workspaceId) });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(workspaceId) });
    },
  });
}

export function useDeleteProject(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return ProjectsClient.remove(workspaceId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(workspaceId) });
    },
  });
}
