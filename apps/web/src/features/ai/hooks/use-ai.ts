import { useMutation, useQuery } from '@tanstack/react-query';
import { aiClient } from '../api/ai.client';

export function useGenerateSummary(workspaceId: string) {
  return useMutation({
    mutationFn: async (text: string) => {
      return aiClient.summarize(workspaceId, text, token ?? undefined);
    },
  });
}

export function useSemanticSearch(workspaceId: string, query: string, limit?: number) {
  return useQuery({
    queryKey: ['ai-semantic-search', workspaceId, query, limit],
    queryFn: async () => {
      return aiClient.semanticSearch(workspaceId, query, limit, token ?? undefined);
    },
    enabled: !!workspaceId && !!query && query.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
