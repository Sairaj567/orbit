import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { updateWorkspaceSchema } from '@orbit/shared';
import { useWorkspaceContext } from '@/components/layout/workspace-context';
import { useUpdateWorkspace } from '../hooks/use-update-workspace';
import { getWorkspacePath } from '@/lib/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Lock, Save } from 'lucide-react';

export function WorkspaceDetailsForm() {
  const { workspace } = useWorkspaceContext();
  const navigate = useNavigate();
  const updateWorkspace = useUpdateWorkspace();

  const isEditable = workspace.role === 'OWNER' || workspace.role === 'ADMIN';

  const [name, setName] = useState(workspace.name || '');
  const [slug, setSlug] = useState(workspace.slug || '');
  const [description, setDescription] = useState(workspace.description || '');
  const [avatarUrl, setAvatarUrl] = useState(workspace.avatarUrl || '');

  const [slugError, setSlugError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Sync form state when workspace context updates
  useEffect(() => {
    setName(workspace.name || '');
    setSlug(workspace.slug || '');
    setDescription(workspace.description || '');
    setAvatarUrl(workspace.avatarUrl || '');
  }, [workspace]);

  const slugChanged = slug.trim().toLowerCase() !== workspace.slug.toLowerCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable) return;

    setSlugError(null);
    setNameError(null);
    setAvatarError(null);

    const rawInput = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
    };

    // Client-side validation using updateWorkspaceSchema from @orbit/shared
    const validation = updateWorkspaceSchema.safeParse(rawInput);
    if (!validation.success) {
      const formatted = validation.error.format();
      if (formatted.name?._errors[0]) setNameError(formatted.name._errors[0]);
      if (formatted.slug?._errors[0]) setSlugError(formatted.slug._errors[0]);
      if (formatted.avatarUrl?._errors[0]) setAvatarError(formatted.avatarUrl._errors[0]);
      return;
    }

    const payload = validation.data;

    try {
      const updated = await updateWorkspace.mutateAsync({
        workspaceId: workspace.id,
        payload,
      });

      toast.success('Workspace updated successfully');

      // Navigate to new URL if slug changed
      if (updated.slug !== workspace.slug) {
        navigate(getWorkspacePath(updated.slug, 'workspace-settings'), { replace: true });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (
        errorMessage.includes('already taken') ||
        errorMessage.includes('409') ||
        (err as { status?: number }).status === 409
      ) {
        setSlugError('This workspace slug is already taken. Please choose another.');
      } else {
        toast.error('Failed to update workspace. Please try again.');
      }
    }
  };

  return (
    <Card className="border-border/70 bg-card/80 shadow-md backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Workspace Details</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              General settings, URL slug, and workspace metadata.
            </CardDescription>
          </div>
          {!isEditable && (
            <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Read-only for members
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <label htmlFor="workspace-name" className="text-xs font-medium text-foreground">
              Workspace Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditable || updateWorkspace.isPending}
              placeholder="e.g. Orbit Home"
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          {/* Workspace Slug */}
          <div className="space-y-1.5">
            <label htmlFor="workspace-slug" className="text-xs font-medium text-foreground">
              Workspace Slug <span className="text-destructive">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground select-none font-mono">/w/</span>
              <Input
                id="workspace-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugError(null);
                }}
                disabled={!isEditable || updateWorkspace.isPending}
                placeholder="orbit-seed-demo"
                className="font-mono text-sm"
              />
            </div>
            {slugError && <p className="text-xs text-destructive">{slugError}</p>}
            {slugChanged && isEditable && !slugError && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Changing the workspace slug will update the URL path for all members.</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="workspace-description" className="text-xs font-medium text-foreground">
              Description
            </label>
            <textarea
              id="workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isEditable || updateWorkspace.isPending}
              placeholder="Workspace overview or focus areas..."
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Avatar URL */}
          <div className="space-y-1.5">
            <label htmlFor="workspace-avatar" className="text-xs font-medium text-foreground">
              Avatar Image URL
            </label>
            <Input
              id="workspace-avatar"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              disabled={!isEditable || updateWorkspace.isPending}
              placeholder="https://example.com/avatar.png"
            />
            {avatarError && <p className="text-xs text-destructive">{avatarError}</p>}
          </div>

          {/* Save Button for OWNER/ADMIN */}
          {isEditable && (
            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={updateWorkspace.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateWorkspace.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
