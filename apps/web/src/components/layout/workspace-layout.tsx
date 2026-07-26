import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router';
import { type WorkspaceOption, getWorkspaceAccent } from '@/config/navigation';
import { getWorkspaceDashboardPath } from '@/lib/routes';
import { AppShell } from './AppShell';
import { WorkspaceContext, type WorkspaceContextValue } from './workspace-context';
import { useRealtimeSync } from '@/hooks/use-realtime-sync';
import { ActiveStudyWidget } from '@/features/study-blocks/components';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { useWorkspaces, type WorkspaceWithRole } from '@/features/workspaces';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface WorkspaceLayoutProps {
  children?: ReactNode;
}

function mapWorkspaceToOption(ws: WorkspaceWithRole): WorkspaceOption {
  return {
    id: ws.id,
    name: ws.name,
    slug: ws.slug,
    role: ws.role,
    description: ws.description,
    avatarUrl: ws.avatarUrl,
    accent: getWorkspaceAccent(ws.id),
  };
}

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  useRealtimeSync();
  const { workspaceSlug } = useParams();
  const navigate = useNavigate();
  const { data: rawWorkspaces, isLoading, isError, refetch } = useWorkspaces();

  const workspaceOptions = useMemo<WorkspaceOption[]>(() => {
    if (!rawWorkspaces) return [];
    return rawWorkspaces.map(mapWorkspaceToOption);
  }, [rawWorkspaces]);

  // Determine active workspace based on URL param or first available
  const activeWorkspace = useMemo<WorkspaceOption | null>(() => {
    if (workspaceOptions.length === 0) return null;
    if (workspaceSlug) {
      const match = workspaceOptions.find((w) => w.slug === workspaceSlug);
      if (match) return match;
    }
    return workspaceOptions[0] || null;
  }, [workspaceOptions, workspaceSlug]);

  // Sync store and handle URL redirect if workspaceSlug is missing or invalid
  useEffect(() => {
    if (isLoading || !rawWorkspaces || rawWorkspaces.length === 0) return;

    if (!activeWorkspace) return;

    // Sync Zustand stores
    useWorkspaceStore.getState().setCurrentWorkspaceId(activeWorkspace.id);
    useWorkspaceStore.getState().setCurrentWorkspaceSlug(activeWorkspace.slug);
    useWorkspaceStore
      .getState()
      .setWorkspaces(rawWorkspaces.map((w) => ({ id: w.id, name: w.name, slug: w.slug })));

    // If URL slug doesn't match active workspace (missing or invalid slug), navigate to active workspace dashboard
    if (workspaceSlug !== activeWorkspace.slug) {
      navigate(getWorkspaceDashboardPath(activeWorkspace.slug), { replace: true });
    }
  }, [activeWorkspace, isLoading, navigate, rawWorkspaces, workspaceSlug]);

  const contextValue = useMemo<WorkspaceContextValue | null>(() => {
    if (!activeWorkspace) return null;
    return {
      workspace: activeWorkspace,
      workspaces: workspaceOptions,
      loading: isLoading,
      setWorkspaceSlug: (nextWorkspaceSlug: string) => {
        navigate(getWorkspaceDashboardPath(nextWorkspaceSlug));
      },
    };
  }, [activeWorkspace, isLoading, navigate, workspaceOptions]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="h-4 w-28 animate-pulse rounded-full bg-muted" />
          <div className="mt-4 h-8 w-3/4 animate-pulse rounded-2xl bg-muted" />
          <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-muted/80" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-muted/80" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="w-full max-w-md rounded-[2rem] border border-destructive/40 bg-card/80 p-6 shadow-2xl backdrop-blur-xl text-center space-y-4">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <h2 className="text-lg font-semibold">Failed to load workspaces</h2>
          <p className="text-sm text-muted-foreground">
            We couldn't retrieve your workspace list. Please check your connection or try again.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state: User belongs to 0 workspaces
  if (!rawWorkspaces || rawWorkspaces.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-2xl text-center space-y-4 backdrop-blur-xl">
          <h2 className="text-xl font-bold">No Workspaces Found</h2>
          <p className="text-sm text-muted-foreground">
            You don't belong to any workspaces yet. Create a workspace or ask your team for an
            invitation.
          </p>
          <div className="pt-2">
            <Button onClick={() => window.location.reload()} variant="default">
              Refresh Workspace List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!contextValue) return null;

  return (
    <WorkspaceContext.Provider value={contextValue}>
      <AppShell>{children ?? <Outlet />}</AppShell>
      <ActiveStudyWidget />
    </WorkspaceContext.Provider>
  );
}
