import { apiClient } from '@/lib/api-client';
import type { SemanticSearchResult, SummarizeResponse } from '@orbit/shared';

export const aiClient = {
  async summarize(workspaceId: string, text: string): Promise<SummarizeResponse> {
    return apiClient<SummarizeResponse>(`/api/workspaces/${workspaceId}/ai/summarize`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async semanticSearch(workspaceId: string, query: string, limit: number = 5): Promise<SemanticSearchResult[]> {
    return apiClient<SemanticSearchResult[]>(`/api/workspaces/${workspaceId}/ai/search`, {
      method: 'GET',
      params: { q: query, limit },
    });
  },
};
