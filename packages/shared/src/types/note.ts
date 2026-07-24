export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  order: number;
  workspaceId: string;
  projectId: string;
  taskId?: string | null;
  aiSummary?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoteFolder {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  sortOrder: number;
  parentId: string | null;
  workspaceId: string;
}
