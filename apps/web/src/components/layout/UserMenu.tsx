import { LogOut, Settings2, User } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import type { WorkspaceRole } from '@orbit/shared';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getWorkspacePath } from '@/lib/routes';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  name: string;
  role: WorkspaceRole;
  email: string;
  workspaceSlug: string;
}

export function UserMenu({ name, role, email, workspaceSlug }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-2 py-1.5 pr-4 text-left transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Open account menu"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/20">
            {name.charAt(0)}
          </span>
          <span className="hidden min-w-0 flex-col sm:flex">
            <span className="truncate text-sm font-medium text-foreground">{name}</span>
            <span className="truncate text-xs text-muted-foreground">{role} · {email}</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
        <div className="my-1 h-px bg-border/70" />
        <DropdownMenuItem onSelect={() => undefined}>
          <Link to={getWorkspacePath(workspaceSlug, 'settings')} className="flex w-full items-center gap-3">
            <User className="h-4 w-4" aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => undefined}>
          <Link to={getWorkspacePath(workspaceSlug, 'settings')} className="flex w-full items-center gap-3">
            <Settings2 className="h-4 w-4" aria-hidden="true" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => undefined}>
          <button type="button" className={cn('flex w-full items-center gap-3 text-destructive')}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}