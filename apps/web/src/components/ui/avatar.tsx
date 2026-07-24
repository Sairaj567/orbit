import type { ImgHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Avatar = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn('relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props} />
));

Avatar.displayName = 'Avatar';

export const AvatarImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(({ className, alt, ...props }, ref) => (
  <img ref={ref} alt={alt ?? ''} className={cn('h-full w-full object-cover', className)} {...props} />
));

AvatarImage.displayName = 'AvatarImage';

interface AvatarFallbackProps {
  children: ReactNode;
  className?: string;
}

export function AvatarFallback({ children, className }: AvatarFallbackProps) {
  return <span className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground', className)}>{children}</span>;
}
