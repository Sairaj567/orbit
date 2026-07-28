import { useState } from 'react';
import { useComments } from '../hooks/use-comments';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2, Edit2, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-hooks';

export function CommentList({ taskId }: { taskId: string }) {
  const { workspace } = useWorkspaceContext();
  const { user } = useAuth();
  const { comments, isLoading, createComment, updateComment, deleteComment } = useComments(
    workspace.slug,
    taskId,
  );

  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-muted rounded-md" />
        <div className="h-12 bg-muted rounded-md" />
      </div>
    );
  }

  const handleCreate = () => {
    if (!newComment.trim()) return;
    createComment(
      { content: newComment.trim() },
      {
        onSuccess: () => setNewComment(''),
      },
    );
  };

  const handleUpdate = (id: string) => {
    if (!editContent.trim()) return;
    updateComment(
      { commentId: id, input: { content: editContent.trim() } },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditContent('');
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold">Comments ({comments.length})</h3>

      <div className="space-y-4">
        {comments.map((comment: any) => {
          const isOwner = user?.id === comment.authorId;
          const isEditing = editingId === comment.id;

          return (
            <div key={comment.id} className="flex space-x-3">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src={comment.author?.avatarUrl} alt={comment.author?.displayName} />
                <AvatarFallback>{comment.author?.displayName?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{comment.author?.displayName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {isOwner && !isEditing && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteComment(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px] text-sm"
                    />
                    <div className="flex space-x-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleUpdate(comment.id)}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground whitespace-pre-wrap mt-1">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex space-x-3 items-start mt-6">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || 'User'} />
          <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <div className="flex justify-end">
            <Button size="sm" disabled={!newComment.trim()} onClick={handleCreate} className="px-4">
              <Send className="h-4 w-4 mr-2" />
              Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
