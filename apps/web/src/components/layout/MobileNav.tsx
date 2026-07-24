import type { NavItem } from '@/config/navigation';
import { Link } from 'react-router';
import { getWorkspacePath } from '@/lib/routes';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  navItems: NavItem[];
  activePath: string;
  workspaceSlug: string;
}

export function MobileNav({ navItems, activePath, workspaceSlug }: MobileNavProps) {
  const items = navItems.filter((item) => item.section === 'main').sort((left, right) => left.order - right.order);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
    >
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activePath === `/${item.path}` || activePath.startsWith(`/${item.path}/`);

          return (
            <Link
              key={item.id}
              to={getWorkspacePath(workspaceSlug, item.path)}
              className={cn(
                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] transition-colors',
                active ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('h-4.5 w-4.5', active ? 'text-primary' : 'text-current')} aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}