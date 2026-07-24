import { useOutletContext } from 'react-router';
import { useResources } from '@/features/resources/hooks/use-resources';
import { ResourceCard } from '@/features/resources/components/resource-card';
import { ResourcePasteInput } from '@/features/resources/components/resource-list';
import type { Project } from '@orbit/shared';

export function ProjectResourcesPage() {
  const { project, workspaceId } = useOutletContext<{ project: Project; workspaceId: string }>();
  
  const { data: resourcesData, isLoading } = useResources(workspaceId, { projectId: project.id });
  const resources = resourcesData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Resources</h2>
      </div>

      <ResourcePasteInput workspaceId={workspaceId} projectId={project.id} />

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h3 className="mt-4 text-lg font-semibold">Attach your first resource</h3>
          <p className="mt-2 text-sm text-muted-foreground mb-4">
            Paste a URL above to add links, GitHub PRs, or documents to this project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} workspaceId={workspaceId} />
          ))}
        </div>
      )}
    </div>
  );
}
