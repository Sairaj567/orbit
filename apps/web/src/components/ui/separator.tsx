import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Separator = forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement>>(({ className, ...props }, ref) => (
  <hr ref={ref} className={cn('border-border/70', className)} {...props} />
));

Separator.displayName = 'Separator';
