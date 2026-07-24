export interface SemanticSearchResult {
  id: string;
  title: string;
  content: string;
  type: 'TASK' | 'NOTE' | 'RESOURCE';
  distance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SummarizeResponse {
  summary: string;
}
