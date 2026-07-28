import { useOutletContext } from 'react-router';
import type { Project } from '@orbit/shared';
import { useProjectActivity } from '@/features/activity/api/use-project-activity';
import { ActivityList } from '@/features/activity/components/activity-list';

export function ProjectActivityPage() {
  const { project, workspaceId } = useOutletContext<{ project: Project; workspaceId: string }>();

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useProjectActivity({
    workspaceId,
    projectId: project.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Activity</h2>
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        <ActivityList
          data={data}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={!!hasNextPage}
          fetchNextPage={fetchNextPage}
          emptyMessage={`Activity for ${project.name} will appear here once tasks are completed or notes are added.`}
        />
      </div>
    </div>
  );
}
