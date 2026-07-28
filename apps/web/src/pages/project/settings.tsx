import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Project } from '@orbit/shared';
import { ProjectMembersList } from '@/features/project-members/components/project-members-list';
import { useUpdateProject, useDeleteProject } from '@/features/projects/hooks/use-projects';
import { useWorkspaceContext } from '@/components/layout/workspace-context';

export function ProjectSettingsPage() {
  const { project, workspaceId } = useOutletContext<{ project: Project; workspaceId: string }>();
  const { workspace } = useWorkspaceContext();
  const navigate = useNavigate();

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [visibility, setVisibility] = useState(project.visibility);

  const { mutateAsync: updateProject, isPending: isUpdating } = useUpdateProject(workspaceId);
  const { mutateAsync: deleteProject, isPending: isDeleting } = useDeleteProject(workspaceId);

  const handleUpdate = async () => {
    try {
      await updateProject({ id: project.id, data: { name, description, visibility } });
    } catch (err) {
      console.error('Failed to update project', err);
    }
  };

  const handleArchive = async () => {
    try {
      await updateProject({ id: project.id, data: { isArchived: true } });
      navigate(`/w/${workspace.slug}/projects`);
    } catch (err) {
      console.error('Failed to archive project', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.'))
      return;
    try {
      await deleteProject(project.id);
      navigate(`/w/${workspace.slug}/projects`);
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  const isDirty =
    name !== project.name ||
    description !== (project.description || '') ||
    visibility !== project.visibility;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Project Settings</h2>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Project Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 max-w-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 max-w-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Visibility</label>
            <select
              className="mt-1 flex h-9 w-full max-w-md items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
            >
              <option value="WORKSPACE">Workspace (All members can view)</option>
              <option value="PRIVATE">Private (Only invited members can view)</option>
              <option value="ASSIGNEES">Assignees (Members assigned to tasks can view)</option>
            </select>
          </div>
          <Button onClick={handleUpdate} disabled={!isDirty || isUpdating || !name.trim()}>
            Save Changes
          </Button>
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
            <Button
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive/10"
              onClick={handleArchive}
              disabled={isUpdating}
            >
              Archive Project
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              Delete Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
