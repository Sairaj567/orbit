import { useMutation, useQuery } from '@tanstack/react-query';
import { aiClient } from '../api/ai.client';

export function useGenerateSummary(workspaceId: string) {
  return useMutation({
    mutationFn: (text: string) => aiClient.summarize(workspaceId, text),
  });
}

export function useSemanticSearch(workspaceId: string, query: string, limit?: number) {
  return useQuery({
    queryKey: ['ai-semantic-search', workspaceId, query, limit],
    queryFn: () => aiClient.semanticSearch(workspaceId, query, limit),
    enabled: !!workspaceId && !!query && query.length > 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
