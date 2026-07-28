import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { WorkspaceRole } from '@orbit/shared';
import { MembersClient } from '@/api/members.client';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { queryKeys } from '@/lib/query-keys';
import { useRealtime } from '@/providers/realtime-provider';
import { useEffect } from 'react';

export function useMembers() {
  const { workspace } = useWorkspaceContext();
  const workspaceId = workspace?.slug;
  const { subscribe } = useRealtime();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!workspaceId) return;

    const unsubCreated = subscribe('member.created', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all(workspaceId) });
    });
    const unsubUpdated = subscribe('member.updated', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all(workspaceId) });
    });
    const unsubDeleted = subscribe('member.deleted', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all(workspaceId) });
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [workspaceId, subscribe, queryClient]);

  return useQuery({
    queryKey: queryKeys.members.all(workspaceId ?? ''),
    queryFn: async () => {
      return MembersClient.findAll(workspaceId!);
    },
    enabled: !!workspaceId,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspaceContext();
  const workspaceId = workspace?.slug;

  return useMutation({
    mutationFn: async (payload: { email: string; role: WorkspaceRole }) => {
      return MembersClient.invite(workspaceId!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.all(workspaceId ?? ''),
      });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspaceContext();
  const workspaceId = workspace?.slug;

  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: WorkspaceRole }) => {
      return MembersClient.updateRole(workspaceId!, memberId, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.all(workspaceId ?? ''),
      });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  const { workspace } = useWorkspaceContext();
  const workspaceId = workspace?.slug;

  return useMutation({
    mutationFn: async (memberId: string) => {
      return MembersClient.remove(workspaceId!, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.members.all(workspaceId ?? ''),
      });
    },
  });
}
