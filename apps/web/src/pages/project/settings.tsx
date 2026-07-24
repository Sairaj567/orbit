import { useOutletContext } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Project } from '@orbit/shared';
import { ProjectMembersList } from '@/features/project-members/components/project-members-list';

export function ProjectSettingsPage() {
  const { project } = useOutletContext<{ project: Project; workspaceId: string }>();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Project Settings</h2>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Project Name</label>
            <Input defaultValue={project.name} className="mt-1 max-w-md" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input defaultValue={project.description || ''} className="mt-1 max-w-md" />
          </div>
          <Button disabled>Save Changes</Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <ProjectMembersList />
        </div>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Archiving a project will hide it from active views. Deleting a project is permanent.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" disabled>
              Archive Project
            </Button>
            <Button variant="destructive" disabled>
              Delete Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
