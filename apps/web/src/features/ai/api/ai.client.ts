import { apiClient } from '@/lib/api-client';
import type { SemanticSearchResult, SummarizeResponse, ApiResponse } from '@orbit/shared';

export const aiClient = {
  async summarize(workspaceId: string, text: string, token?: string): Promise<SummarizeResponse> {
    const response = await apiClient<ApiResponse<SummarizeResponse>>(
      `/api/v1/workspaces/${workspaceId}/ai/summarize`,
      {
        method: 'POST',
        body: JSON.stringify({ text }),
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    return response.data;
  },

  async semanticSearch(
    workspaceId: string,
    query: string,
    limit: number = 5,
    token?: string,
  ): Promise<SemanticSearchResult[]> {
    const response = await apiClient<ApiResponse<SemanticSearchResult[]>>(
      `/api/v1/workspaces/${workspaceId}/ai/search`,
      {
        method: 'GET',
        params: { q: query, limit },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    return response.data;
  },
};
