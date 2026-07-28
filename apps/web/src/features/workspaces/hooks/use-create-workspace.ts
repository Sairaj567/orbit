import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkspacesClient, type WorkspaceWithRole } from '../api/workspaces.client';
import { workspaceKeys } from './use-workspaces';

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation<
    WorkspaceWithRole,
    Error,
    { name: string; slug: string; description?: string }
  >({
    mutationFn: async (payload) => {
      return WorkspacesClient.create(payload);
    },
    onSuccess: (newWorkspace) => {
      queryClient.setQueryData<WorkspaceWithRole[]>(workspaceKeys.all, (old) => {
        if (!old) return [newWorkspace];
        return [...old, newWorkspace];
      });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
    },
  });
}
