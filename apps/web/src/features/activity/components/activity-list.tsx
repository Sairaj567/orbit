import { Loader2 } from 'lucide-react';
import { ActivityItem } from './activity-item';
import type { Activity } from '@orbit/shared';

interface ActivityListProps {
  data: {
    pages: Array<{ data: Activity[]; nextCursor?: string }>;
  } | undefined;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  emptyMessage?: string;
}

export function ActivityList({ 
  data, 
  isLoading, 
  isFetchingNextPage, 
  hasNextPage, 
  fetchNextPage,
  emptyMessage = 'No recent activity.'
}: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allActivities = data?.pages.flatMap(page => page.data) || [];

  if (allActivities.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="divide-y">
        {allActivities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
        >
          {isFetchingNextPage ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading more...
            </span>
          ) : (
            'Load older activity'
          )}
        </button>
      )}
    </div>
  );
}
