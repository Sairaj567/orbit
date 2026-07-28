import { apiClient } from '@/lib/api-client';
import type { TaskComment, CreateTaskCommentInput, UpdateTaskCommentInput } from '@orbit/shared';

class CommentsClient {
  async getComments(workspaceId: string, taskId: string): Promise<TaskComment[]> {
    return apiClient<TaskComment[]>(`/workspaces/${workspaceId}/tasks/${taskId}/comments`, {
      method: 'GET',
    });
  }

  async createComment(
    workspaceId: string,
    taskId: string,
    input: CreateTaskCommentInput,
  ): Promise<TaskComment> {
    return apiClient<TaskComment>(`/workspaces/${workspaceId}/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateComment(
    workspaceId: string,
    taskId: string,
    commentId: string,
    input: UpdateTaskCommentInput,
  ): Promise<TaskComment> {
    return apiClient<TaskComment>(
      `/workspaces/${workspaceId}/tasks/${taskId}/comments/${commentId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(input),
      },
    );
  }

  async deleteComment(workspaceId: string, taskId: string, commentId: string): Promise<void> {
    return apiClient<void>(`/workspaces/${workspaceId}/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  }
}

export const commentsClient = new CommentsClient();
