import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps extends HTMLAttributes<HTMLDivElement> {
  minItemWidth?: string;
}

export const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(({ className, minItemWidth = '18rem', style, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('grid gap-4', className)}
    style={{
      gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
      ...style,
    }}
    {...props}
  />
));

ResponsiveGrid.displayName = 'ResponsiveGrid';
