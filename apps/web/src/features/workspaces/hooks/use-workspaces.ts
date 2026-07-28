import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-hooks';
import { WorkspacesClient, type WorkspaceWithRole } from '../api/workspaces.client';

export const workspaceKeys = {
  all: ['workspaces'] as const,
};

export function useWorkspaces() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<WorkspaceWithRole[]>({
    queryKey: workspaceKeys.all,
    queryFn: async () => {
      const token = await getToken();
      return WorkspacesClient.findAll(token ?? undefined);
    },
    enabled: !!isSignedIn,
  });
}
