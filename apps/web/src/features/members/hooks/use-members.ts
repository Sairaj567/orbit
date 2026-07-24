import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { WorkspaceRole } from '@orbit/shared';
import { MembersClient } from '@/api/members.client';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { useAuth } from '@clerk/clerk-react';

export const membersKeys = {
  all: (workspaceId: string) => ['members', workspaceId] as const,
};

export function useMembers() {
  const { workspace } = useWorkspaceContext();
  const workspaceId = workspace?.slug;
  const { getToken } = useAuth();

  return useQuery({
    queryKey: membersKeys.all(workspaceId ?? ''),
    queryFn: async () => {
      const token = await getToken();
      return MembersClient.findAll(workspaceId!, token!);
    },
    enabled: !!workspaceId,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspaceContext();
  const workspaceId = workspace?.slug;
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (payload: { email: string; role: WorkspaceRole }) => {
      const token = await getToken();
      return MembersClient.invite(workspaceId!, payload, token!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: membersKeys.all(workspaceId ?? ''),
      });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspaceContext();
  const workspaceId = workspace?.slug;
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: WorkspaceRole;
    }) => {
      const token = await getToken();
      return MembersClient.updateRole(workspaceId!, memberId, { role }, token!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: membersKeys.all(workspaceId ?? ''),
      });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspaceContext();
  const workspaceId = workspace?.slug;
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const token = await getToken();
      return MembersClient.remove(workspaceId!, memberId, token!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: membersKeys.all(workspaceId ?? ''),
      });
    },
  });
}
