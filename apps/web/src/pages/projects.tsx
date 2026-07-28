import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { Link } from 'react-router';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateProjectDialog } from '@/features/projects/components/create-project-dialog';

export function ProjectsPage() {
  const { workspace } = useWorkspaceContext();
  const workspaceId = workspace.id;
  const workspaceSlug = workspace.slug;
  const { data, isLoading, error } = useProjects(workspaceId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Projects"
        description="Organize your tasks, habits, and notes into focused spaces."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        }
      />

      <CreateProjectDialog
        workspaceId={workspaceId}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <div className="flex-1 overflow-auto p-6">
        {isLoading && <div className="text-muted-foreground">Loading projects...</div>}
        {error && <div className="text-destructive">Failed to load projects.</div>}

        {data?.data && data.data.length === 0 && (
          <div className="text-muted-foreground">No projects yet. Create one to get started!</div>
        )}

        {data?.data && data.data.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((project) => (
              <Link key={project.id} to={`/w/${workspaceSlug}/projects/${project.id}`}>
                <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <div className="flex items-center gap-3">
                    {project.icon && <span className="text-2xl">{project.icon}</span>}
                    <div>
                      <h3 className="font-medium text-foreground">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
