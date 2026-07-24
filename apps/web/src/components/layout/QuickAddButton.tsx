import { Plus } from 'lucide-react';

interface QuickAddButtonProps {
  onClick?: () => void;
}

export function QuickAddButton({ onClick }: QuickAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-primary/30 bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] hover:border-primary/50 hover:shadow-xl hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      <span>Quick add</span>
    </button>
  );
}