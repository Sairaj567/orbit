import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from 'react';
import { forwardRef } from 'react';
import { Search } from 'lucide-react';
import { Command as CommandPrimitive } from 'cmdk';
import { cn } from '@/lib/utils';

export function Command({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: ReactNode }) {
  return (
    <CommandPrimitive value={value} onValueChange={onValueChange} className="overflow-hidden rounded-3xl border border-border/70 bg-popover text-popover-foreground shadow-xl shadow-black/20">
      {children}
    </CommandPrimitive>
  );
}

export function CommandInput({ placeholder = 'Search…' }: { placeholder?: string }) {
  return (
    <div className="relative border-b border-border/70 px-4 py-3">
      <Search className="pointer-events-none absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <CommandPrimitive.Input
        className="h-12 w-full rounded-2xl border border-border/70 bg-background/80 pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
        placeholder={placeholder}
      />
    </div>
  );
}

export function CommandList({ className, children }: { className?: string; children: ReactNode }) {
  return <CommandPrimitive.List className={cn('max-h-80 overflow-y-auto p-2', className)}>{children}</CommandPrimitive.List>;
}

export function CommandEmpty({ children }: { children: ReactNode }) {
  return <CommandPrimitive.Empty className="p-6 text-center text-sm text-muted-foreground">{children}</CommandPrimitive.Empty>;
}

export const CommandItem = forwardRef<
  ElementRef<typeof CommandPrimitive.Item>,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'flex cursor-pointer items-center rounded-2xl px-3 py-2 text-left text-sm text-foreground transition-colors aria-selected:bg-accent aria-selected:text-accent-foreground',
      className,
    )}
    {...props}
  />
));

CommandItem.displayName = 'CommandItem';
