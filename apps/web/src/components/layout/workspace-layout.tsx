import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router';
import { WORKSPACES, type WorkspaceOption } from '@/config/navigation';
import { DEFAULT_WORKSPACE_SLUG, getWorkspaceDashboardPath } from '@/lib/routes';
import { AppShell } from './AppShell';
import { WorkspaceContext, type WorkspaceContextValue } from './workspace-context';
import { useRealtimeSync } from '@/hooks/use-realtime-sync';
import { ActiveStudyWidget } from '@/features/study-blocks/components';
import { useWorkspaceStore } from '@/stores/workspace.store';

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  useRealtimeSync();
  const { workspaceSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<WorkspaceOption>(() => WORKSPACES[0] ?? WORKSPACES[0]!);

  useEffect(() => {
    let active = true;
    const resolvedSlug = workspaceSlug ?? DEFAULT_WORKSPACE_SLUG;
    const nextWorkspace = WORKSPACES.find((item) => item.slug === resolvedSlug) ?? WORKSPACES[0]!;

    setLoading(true);

    const timeout = window.setTimeout(() => {
      if (!active) {
        return;
      }

      setWorkspace(nextWorkspace);
      useWorkspaceStore.getState().setCurrentWorkspaceId(nextWorkspace.slug);
      setLoading(false);

      if (workspaceSlug !== nextWorkspace.slug) {
        navigate(getWorkspaceDashboardPath(nextWorkspace.slug), { replace: true });
      }
    }, 120);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [navigate, workspaceSlug]);

  const contextValue = useMemo<WorkspaceContextValue>(
    () => ({
      workspace,
      workspaces: WORKSPACES,
      loading,
      setWorkspaceSlug: (nextWorkspaceSlug: string) => {
        navigate(getWorkspaceDashboardPath(nextWorkspaceSlug));
      },
    }),
    [loading, navigate, workspace],
  );

  if (loading) {
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

  return (
    <WorkspaceContext.Provider value={contextValue}>
      <AppShell>
        {children ?? <Outlet />}
      </AppShell>
      <ActiveStudyWidget />
    </WorkspaceContext.Provider>
  );
}
