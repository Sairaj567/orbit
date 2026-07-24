import type { TaskStatus, Priority, RecurrenceType } from './enums.js';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  estimatedDuration: number | null;
  actualDuration: number | null;
  tags: string[];
  workspaceId: string;
  creatorId: string;
  categoryId: string | null;
  projectId: string | null;
  rrule: string | null;
  timezone: string | null;
  recurrenceType: RecurrenceType | null;
  rootTaskId: string | null;
  nextOccurrenceId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  aiSummary?: string | null;
  resources?: import('./resource.js').Resource[];
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  sortOrder: number;
  taskId: string;
}

export interface TaskComment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
