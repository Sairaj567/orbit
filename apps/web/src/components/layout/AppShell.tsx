import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import type { BreadcrumbItem, WorkspaceOption } from '@/config/navigation';
import { NAV_ITEMS, QUICK_ACTIONS } from '@/config/navigation';
import { getWorkspaceDashboardPath, getWorkspacePath, stripWorkspaceBasePath } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useWorkspaceContext } from './workspace-context';
import { CommandPalette } from '../command-palette';

interface AppShellProps {
  children: ReactNode;
}

function buildBreadcrumbs(pathname: string, workspace: WorkspaceOption): BreadcrumbItem[] {
  const normalized = stripWorkspaceBasePath(pathname, workspace.slug) || '/dashboard';
  const segments = normalized.split('/').filter(Boolean);

  const crumbs: BreadcrumbItem[] = [
    { label: workspace.name, href: getWorkspaceDashboardPath(workspace.slug) },
  ];

  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    study: 'Study',
    habits: 'Habits',
    notes: 'Notes',
    calendar: 'Calendar',
    analytics: 'Analytics',
    activity: 'Activity',
    'workspace-settings': 'Workspace Settings',
    settings: 'Settings',
  };

  segments.forEach((segment, index) => {
    const href = getWorkspacePath(workspace.slug, segments.slice(0, index + 1).join('/'));
    crumbs.push({
      label: labels[segment] ?? segment.replace(/-/g, ' '),
      href,
    });
  });

  return crumbs;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const { loading, setWorkspaceSlug, workspace, workspaces } = useWorkspaceContext();
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const pathname = location.pathname;
  const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname, workspace), [pathname, workspace]);
  const activePath = stripWorkspaceBasePath(pathname, workspace.slug) || '/dashboard';

  const handleCloseOverlays = () => {
    setSearchOpen(false);
    setQuickAddOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_25%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-[1920px]">
        <Sidebar
          workspaces={workspaces}
          currentWorkspace={workspace}
          navItems={NAV_ITEMS}
          activePath={activePath}
          workspaceSlug={workspace.slug}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          onWorkspaceChange={setWorkspaceSlug}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            breadcrumbs={breadcrumbs}
            workspace={workspace}
            workspaceSlug={workspace.slug}
            onSearch={() => setSearchOpen(true)}
            onQuickAdd={() => setQuickAddOpen(true)}
          />

          <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-8">
            {loading ? (
              <div className="rounded-[2rem] border border-border/70 bg-card/70 p-6">
                <div className="h-6 w-40 animate-pulse rounded-full bg-muted" />
                <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-muted/80" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-muted/80" />
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>

      <MobileNav navItems={NAV_ITEMS} activePath={activePath} workspaceSlug={workspace.slug} />

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />

      {quickAddOpen ? (
        <OverlayShell title="Quick add" onClose={handleCloseOverlays} compact>
          <div className="space-y-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.id}
                to={getWorkspacePath(workspace.slug, action.path)}
                className="flex items-center justify-between rounded-2xl border border-border/70 px-3 py-3 transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground"
                onClick={handleCloseOverlays}
              >
                <span>
                  <span className="block text-sm font-medium">{action.label}</span>
                  <span className="block text-xs text-muted-foreground">{action.description}</span>
                </span>
                <span className="text-xs font-medium text-primary">Open</span>
              </Link>
            ))}
          </div>
        </OverlayShell>
      ) : null}
    </div>
  );
}

interface OverlayShellProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  compact?: boolean;
  align?: 'center' | 'right';
}

function OverlayShell({
  title,
  children,
  onClose,
  compact = false,
  align = 'center',
}: OverlayShellProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 px-4 py-6 backdrop-blur-md">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative mx-auto w-full overflow-hidden rounded-3xl border border-border/70 bg-popover/95 text-popover-foreground shadow-2xl shadow-black/40 backdrop-blur-xl',
          compact ? 'max-w-xl' : 'max-w-3xl',
          align === 'right' && 'mr-0 ml-auto max-w-md',
        )}
      >
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">Press Escape or click outside to close</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            ×
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
