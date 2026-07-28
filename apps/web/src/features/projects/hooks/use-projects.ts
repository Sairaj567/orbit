import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-hooks';
import { ProjectsClient } from '../api/projects.client';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryInput,
  Project,
} from '@orbit/shared';
import type { PaginationMeta } from '../api/projects.client';

export const projectKeys = {
  all: (workspaceId: string) => ['projects', workspaceId] as const,
  lists: (workspaceId: string) => [...projectKeys.all(workspaceId), 'list'] as const,
  list: (workspaceId: string, query: Partial<ProjectQueryInput>) =>
    [...projectKeys.lists(workspaceId), { query }] as const,
  details: (workspaceId: string) => [...projectKeys.all(workspaceId), 'detail'] as const,
  detail: (workspaceId: string, id: string) => [...projectKeys.details(workspaceId), id] as const,
};

export function useProjects(workspaceId: string, query: Partial<ProjectQueryInput> = {}) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: projectKeys.list(workspaceId, query),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return ProjectsClient.findAll(workspaceId, query, token);
    },
    enabled: !!workspaceId,
  });
}

export function useProject(workspaceId: string, id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: projectKeys.detail(workspaceId, id),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return ProjectsClient.findOne(workspaceId, id, token);
    },
    enabled: !!workspaceId && !!id,
  });
}

export function useCreateProject(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return ProjectsClient.create(workspaceId, data, token);
    },
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.lists(workspaceId) });
      const previousLists = queryClient.getQueriesData({
        queryKey: projectKeys.lists(workspaceId),
      });

      queryClient.setQueriesData(
        { queryKey: projectKeys.lists(workspaceId) },
        (old: { data: Project[]; meta: PaginationMeta } | undefined) => {
          if (!old || !old.data) return old;
          const optimisticProject = {
            id: `temp-${Date.now()}`,
            ...newProject,
            description: newProject.description || null,
            icon: newProject.icon || null,
            color: newProject.color || null,
            coverImage: newProject.coverImage || null,
            status: newProject.status || 'ACTIVE',
            visibility: newProject.visibility || 'WORKSPACE',
            isArchived: false,
            progress: 0,
            order: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            workspaceId,
            creatorId: 'me',
            deletedAt: null,
          };
          return {
            ...old,
            data: [optimisticProject, ...old.data],
            meta: { ...old.meta, total: (old.meta?.total || 0) + 1 },
          };
        },
      );
      return { previousLists };
    },
    onError: (_err, _newProject, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(workspaceId) });
    },
  });
}

export function useUpdateProject(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectInput }) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return ProjectsClient.update(workspaceId, id, data, token);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(workspaceId, id) });
      await queryClient.cancelQueries({ queryKey: projectKeys.lists(workspaceId) });

      const previousDetail = queryClient.getQueryData(projectKeys.detail(workspaceId, id));
      const previousLists = queryClient.getQueriesData({
        queryKey: projectKeys.lists(workspaceId),
      });

      if (previousDetail) {
        queryClient.setQueryData(projectKeys.detail(workspaceId, id), {
          ...(previousDetail as Project),
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      queryClient.setQueriesData(
        { queryKey: projectKeys.lists(workspaceId) },
        (old: { data: Project[]; meta: PaginationMeta } | undefined) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: old.data.map((project: Project) =>
              project.id === id ? { ...project, ...data } : project,
            ),
          };
        },
      );

      return { previousDetail, previousLists };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          projectKeys.detail(workspaceId, _variables.id),
          context.previousDetail,
        );
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(workspaceId, variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(workspaceId) });
    },
  });
}

export function useDeleteProject(workspaceId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return ProjectsClient.remove(workspaceId, id, token);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(workspaceId, id) });
      await queryClient.cancelQueries({ queryKey: projectKeys.lists(workspaceId) });

      const previousLists = queryClient.getQueriesData({
        queryKey: projectKeys.lists(workspaceId),
      });

      queryClient.setQueriesData(
        { queryKey: projectKeys.lists(workspaceId) },
        (old: { data: Project[]; meta: PaginationMeta } | undefined) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: old.data.filter((project: Project) => project.id !== id),
            meta: { ...old.meta, total: Math.max(0, (old.meta?.total || 0) - 1) },
          };
        },
      );

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
      queryClient.removeQueries({ queryKey: projectKeys.detail(workspaceId, id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(workspaceId) });
    },
  });
}
