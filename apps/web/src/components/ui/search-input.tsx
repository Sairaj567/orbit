import { Search, X } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { Input } from './input';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({ className, onClear, value, ...props }, ref) => (
  <div className="relative">
    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    <Input ref={ref} value={value} className={cn('pl-11 pr-12', className)} {...props} />
    {value ? (
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
        onClick={onClear}
        aria-label="Clear search"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    ) : null}
  </div>
));

SearchInput.displayName = 'SearchInput';
