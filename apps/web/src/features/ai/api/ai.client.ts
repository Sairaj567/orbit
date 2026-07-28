import { apiClient } from '@/lib/api-client';
import type { SemanticSearchResult, SummarizeResponse, ApiResponse } from '@orbit/shared';

export const aiClient = {
  async summarize(workspaceId: string, text: string): Promise<SummarizeResponse> {
    const response = await apiClient<ApiResponse<SummarizeResponse>>(
      `/api/v1/workspaces/${workspaceId}/ai/summarize`,
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      },
    );
    return response.data;
  },

  async semanticSearch(
    workspaceId: string,
    query: string,
    limit: number = 5,
  ): Promise<SemanticSearchResult[]> {
    const response = await apiClient<ApiResponse<SemanticSearchResult[]>>(
      `/api/v1/workspaces/${workspaceId}/ai/search`,
      {
        method: 'GET',
        params: { q: query, limit },
      },
    );
    return response.data;
  },
};
