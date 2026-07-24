import { formatDistanceToNow } from 'date-fns';
import type { Activity } from '@orbit/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const { action, entityType, actorName, metadata, createdAt, user } = activity;

  // Format timestamp
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  // Generate description based on action and entity type
  const getDescription = () => {
    const actionLower = action.toLowerCase();
    const typeLower = entityType.toLowerCase();
    
    // Add custom descriptions for specific combinations if needed
    if (entityType === 'TASK' && action === 'COMPLETED') {
      return `completed task ${metadata?.title ? `"${metadata.title}"` : ''}`;
    }

    if (entityType === 'MEMBER') {
      if (action === 'INVITED') return `invited ${metadata?.email || 'a new member'}`;
      if (action === 'JOINED') return `joined the workspace`;
      if (action === 'REMOVED') return `removed a member`;
      if (action === 'UPDATED') return `updated role to ${metadata?.role}`;
    }

    // Default formatting: e.g. "created project 'Title'"
    const entityName = metadata?.title || metadata?.name || '';
    return `${actionLower} ${typeLower} ${entityName ? `"${entityName}"` : ''}`;
  };

  return (
    <div className="flex items-start gap-3 py-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.avatarUrl || ''} alt={actorName || 'User'} />
        <AvatarFallback className="text-xs">
          {actorName?.substring(0, 2).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <p className="text-sm leading-none">
          <span className="font-medium text-foreground">{actorName || 'Someone'}</span>{' '}
          <span className="text-muted-foreground">{getDescription()}</span>
        </p>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </div>
  );
}
