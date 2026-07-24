import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { NavItem, WorkspaceOption } from '@/config/navigation';
import { getWorkspacePath } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { UserMenu } from './UserMenu';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

interface SidebarProps {
  workspaces: WorkspaceOption[];
  currentWorkspace: WorkspaceOption;
  navItems: NavItem[];
  activePath: string;
  workspaceSlug: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onWorkspaceChange: (workspaceSlug: string) => void;
}

export function Sidebar({
  workspaces,
  currentWorkspace,
  navItems,
  activePath,
  workspaceSlug,
  collapsed,
  onToggleCollapse,
  onWorkspaceChange,
}: SidebarProps) {
  const mainItems = navItems.filter((item) => item.section === 'main').sort((left, right) => left.order - right.order);
  const secondaryItems = navItems
    .filter((item) => item.section === 'secondary')
    .sort((left, right) => left.order - right.order);
  const footerItems = navItems.filter((item) => item.section === 'footer').sort((left, right) => left.order - right.order);

  return (
    <aside
      className={cn(
        'hidden min-h-screen border-r border-border/70 bg-card/75 backdrop-blur-xl lg:flex lg:flex-col',
        collapsed ? 'w-20' : 'w-80',
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/20">
            O
          </div>
          {!collapsed ? (
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-foreground">ORBIT</p>
              <p className="text-xs text-muted-foreground">Workspace command center</p>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>

      <div className={cn('flex-1 space-y-6 overflow-y-auto px-4 py-4', collapsed && 'px-3')}>
        <WorkspaceSwitcher
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
          onSelect={(workspace) => onWorkspaceChange(workspace.slug)}
        />

        <nav className="space-y-5" aria-label="Primary">
          <NavSection title="Main" collapsed={collapsed}>
            {mainItems.map((item) => (
              <NavLink key={item.id} item={item} activePath={activePath} collapsed={collapsed} />
            ))}
          </NavSection>

          <NavSection title="Explore" collapsed={collapsed}>
            {secondaryItems.map((item) => (
              <NavLink key={item.id} item={item} activePath={activePath} collapsed={collapsed} />
            ))}
          </NavSection>

          <NavSection title="Workspace" collapsed={collapsed}>
            {footerItems.map((item) => (
              <NavLink key={item.id} item={item} activePath={activePath} collapsed={collapsed} />
            ))}
          </NavSection>
        </nav>
      </div>

      <div className="border-t border-border/70 p-4">
        <UserMenu name="Saira Khan" role={currentWorkspace.role} email="saira@orbit.app" workspaceSlug={workspaceSlug} />
      </div>
    </aside>
  );
}

interface NavSectionProps {
  title: string;
  collapsed: boolean;
  children: ReactNode;
}

function NavSection({ title, collapsed, children }: NavSectionProps) {
  return (
    <section className="space-y-2">
      {!collapsed ? (
        <div className="px-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
      ) : null}
      <div className="space-y-1">{children}</div>
    </section>
  );
}

interface NavLinkProps {
  item: NavItem;
  activePath: string;
  collapsed: boolean;
}

function NavLink({ item, activePath, collapsed }: NavLinkProps) {
  const active = activePath === `/${item.path}` || activePath.startsWith(`/${item.path}/`);
  const Icon = item.icon;

  return (
    <Link
      to={getWorkspacePath(activePath.split('/')[2] ?? 'home', item.path)}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        active
          ? 'border-primary/30 bg-primary/10 text-foreground shadow-lg shadow-primary/10'
          : 'border-transparent text-muted-foreground hover:border-border/70 hover:bg-background/70 hover:text-foreground',
        collapsed && 'justify-center px-2.5',
      )}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
    >
      <Icon className={cn('h-4.5 w-4.5 shrink-0', active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} aria-hidden="true" />
      {!collapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
      {!collapsed && item.badge ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{item.badge()}</span>
      ) : null}
      {!collapsed && item.isExternal ? <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/70" aria-hidden="true" /> : null}
    </Link>
  );
}