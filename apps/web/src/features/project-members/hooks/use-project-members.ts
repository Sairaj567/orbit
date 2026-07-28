import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectMembersClient } from '../api/project-members.client';
import { useAuth } from '@/lib/auth-hooks';

export const projectMembersKeys = {
  all: (workspaceId: string, projectId: string) =>
    ['workspaces', workspaceId, 'projects', projectId, 'members'] as const,
};

export function useProjectMembers(workspaceId: string, projectId: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: projectMembersKeys.all(workspaceId, projectId),
    queryFn: async () => {
      const token = await getToken();
      return ProjectMembersClient.getMembers(workspaceId, projectId, token!);
    },
    enabled: !!workspaceId && !!projectId,
  });
}

export function useInviteProjectMember() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      workspaceId,
      projectId,
      workspaceMemberId,
      role,
    }: {
      workspaceId: string;
      projectId: string;
      workspaceMemberId: string;
      role: 'VIEWER' | 'EDITOR' | 'OWNER';
    }) => {
      const token = await getToken();
      return ProjectMembersClient.invite(workspaceId, projectId, workspaceMemberId, role, token!);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectMembersKeys.all(variables.workspaceId, variables.projectId),
      });
    },
  });
}

export function useUpdateProjectMemberRole() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      workspaceId,
      projectId,
      memberId,
      role,
    }: {
      workspaceId: string;
      projectId: string;
      memberId: string;
      role: 'VIEWER' | 'EDITOR' | 'OWNER';
    }) => {
      const token = await getToken();
      return ProjectMembersClient.updateRole(workspaceId, projectId, memberId, role, token!);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectMembersKeys.all(variables.workspaceId, variables.projectId),
      });
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async ({
      workspaceId,
      projectId,
      memberId,
    }: {
      workspaceId: string;
      projectId: string;
      memberId: string;
    }) => {
      const token = await getToken();
      return ProjectMembersClient.remove(workspaceId, projectId, memberId, token!);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectMembersKeys.all(variables.workspaceId, variables.projectId),
      });
    },
  });
}
