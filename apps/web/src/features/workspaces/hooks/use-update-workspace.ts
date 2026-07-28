import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdateWorkspaceInput } from '@orbit/shared';
import { WorkspacesClient, type WorkspaceWithRole } from '../api/workspaces.client';
import { workspaceKeys } from './use-workspaces';

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkspaceWithRole,
    Error,
    { workspaceId: string; payload: UpdateWorkspaceInput }
  >({
    mutationFn: async ({ workspaceId, payload }) => {
      return WorkspacesClient.update(workspaceId, payload);
    },
    onSuccess: (updatedWorkspace) => {
      queryClient.setQueryData<WorkspaceWithRole[]>(workspaceKeys.all, (old) => {
        if (!old) return [updatedWorkspace];
        return old.map((w) => (w.id === updatedWorkspace.id ? updatedWorkspace : w));
      });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}
