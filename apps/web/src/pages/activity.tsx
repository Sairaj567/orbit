import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { useWorkspaceActivity } from '@/features/activity/api/use-workspace-activity';
import { ActivityList } from '@/features/activity/components/activity-list';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ActivityPage() {
  const { workspace } = useWorkspaceContext();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useWorkspaceActivity({ workspaceId: workspace.slug });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Stream"
        description="Audit trail of workspace edits, task updates, focus blocks, and project changes."
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh Feed
          </Button>
        }
      />

      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <ActivityList
            data={data}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage || false}
            fetchNextPage={fetchNextPage}
            emptyMessage="No workspace activity recorded yet."
          />
        </CardContent>
      </Card>
    </div>
  );
}