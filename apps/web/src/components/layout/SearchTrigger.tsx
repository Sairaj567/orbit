import { Search } from 'lucide-react';

interface SearchTriggerProps {
  onClick?: () => void;
}

export function SearchTrigger({ onClick }: SearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:shadow-lg hover:shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      aria-label="Open search"
    >
      <Search className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="rounded-md border border-border/70 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
        Ctrl K
      </kbd>
    </button>
  );
}