import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-hooks';
import { aiClient } from '../api/ai.client';

export function useGenerateSummary(workspaceId: string) {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (text: string) => {
      const token = await getToken();
      return aiClient.summarize(workspaceId, text, token ?? undefined);
    },
  });
}

export function useSemanticSearch(workspaceId: string, query: string, limit?: number) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['ai-semantic-search', workspaceId, query, limit],
    queryFn: async () => {
      const token = await getToken();
      return aiClient.semanticSearch(workspaceId, query, limit, token ?? undefined);
    },
    enabled: !!workspaceId && !!query && query.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
