import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsClient } from '../api/comments.client';
import { toast } from 'sonner';
import type { CreateTaskCommentInput, UpdateTaskCommentInput } from '@orbit/shared';

export const commentKeys = {
  all: (workspaceId: string, taskId: string) => ['comments', workspaceId, taskId] as const,
};

export function useComments(workspaceId: string, taskId: string) {
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: commentKeys.all(workspaceId, taskId),
    queryFn: () => commentsClient.getComments(workspaceId, taskId),
    enabled: !!workspaceId && !!taskId,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateTaskCommentInput) =>
      commentsClient.createComment(workspaceId, taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all(workspaceId, taskId) });
      toast.success('Comment added');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, input }: { commentId: string; input: UpdateTaskCommentInput }) =>
      commentsClient.updateComment(workspaceId, taskId, commentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all(workspaceId, taskId) });
      toast.success('Comment updated');
    },
    onError: () => {
      toast.error('Failed to update comment');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => commentsClient.deleteComment(workspaceId, taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all(workspaceId, taskId) });
      toast.success('Comment deleted');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    createComment: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateComment: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteComment: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
