import { useQuery } from '@tanstack/react-query';
import { WorkspacesClient, type WorkspaceWithRole } from '../api/workspaces.client';

export const workspaceKeys = {
  all: ['workspaces'] as const,
};

export function useWorkspaces() {
  return useQuery<WorkspaceWithRole[]>({
    queryKey: workspaceKeys.all,
    queryFn: async () => {
      return WorkspacesClient.findAll(token ?? undefined);
    },
    enabled: !!isSignedIn,
  });
}
