import type { BreadcrumbItem, WorkspaceOption } from '@/config/navigation';
import { Breadcrumbs } from './Breadcrumbs';
import { QuickAddButton } from './QuickAddButton';
import { SearchTrigger } from './SearchTrigger';
import { UserMenu } from './UserMenu';
import { ConnectionStatus } from './ConnectionStatus';

interface TopBarProps {
  breadcrumbs: BreadcrumbItem[];
  workspace: WorkspaceOption;
  workspaceSlug: string;
  onSearch: () => void;
  onQuickAdd: () => void;
}

export function TopBar({
  breadcrumbs,
  workspace,
  workspaceSlug,
  onSearch,
  onQuickAdd,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1 space-y-1">
          <Breadcrumbs items={breadcrumbs} />
          <div className="flex items-center gap-3">
            <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {workspace.name}
            </h1>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {workspace.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden xl:block">
            <SearchTrigger onClick={onSearch} />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <ConnectionStatus />
            <QuickAddButton onClick={onQuickAdd} />
          </div>
          <div className="hidden lg:block">
            <UserMenu
              name="Saira Khan"
              role={workspace.role}
              email="saira@orbit.app"
              workspaceSlug={workspaceSlug}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
