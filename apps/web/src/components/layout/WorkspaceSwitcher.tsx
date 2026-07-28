import { Check, ChevronDown, CircleUserRound, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getWorkspaceAccent, type WorkspaceOption } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { CreateWorkspaceDialog } from '@/features/workspaces/components/CreateWorkspaceDialog';

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceOption[];
  currentWorkspace: WorkspaceOption;
  onSelect: (workspace: WorkspaceOption) => void;
}

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
  onSelect,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-background/60 px-3 py-2.5 text-left transition-all hover:border-primary/40 hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            aria-label="Switch workspace"
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br',
                currentWorkspace.accent || getWorkspaceAccent(currentWorkspace.id),
              )}
            >
              <Sparkles className="h-4 w-4 text-primary-foreground/90" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-foreground">
                  {currentWorkspace.name}
                </span>
                <CircleUserRound className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {currentWorkspace.role}
                {currentWorkspace.members !== undefined
                  ? ` · ${currentWorkspace.members} members`
                  : ''}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2">
          <div className="px-2 pb-2 pt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Workspaces
          </div>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {workspaces.map((workspace) => {
              const selected = workspace.id === currentWorkspace.id;

              return (
                <button
                  type="button"
                  key={workspace.id}
                  onClick={() => {
                    onSelect(workspace);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground',
                    selected && 'bg-accent text-accent-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'mt-1 h-2.5 w-2.5 rounded-full',
                      selected ? 'bg-primary' : 'bg-muted-foreground/50',
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{workspace.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {workspace.role}
                      {workspace.status ? ` · ${workspace.status}` : ''}
                    </span>
                  </span>
                  {selected ? (
                    <Check className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setShowCreateDialog(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-medium">Create New Workspace</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <CreateWorkspaceDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  );
}
