import { useOutletContext } from 'react-router';
import type { Project } from '@orbit/shared';

export function ProjectActivityPage() {
  const { project } = useOutletContext<{ project: Project; workspaceId: string }>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Activity</h2>
      </div>

      <div className="rounded-xl border border-dashed p-12 text-center">
        <h3 className="mt-4 text-lg font-semibold">No recent activity</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Activity for {project.name} will appear here once tasks are completed or notes are added.
        </p>
      </div>
    </div>
  );
}
