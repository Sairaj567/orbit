import { Link } from 'react-router';
import type { BreadcrumbItem } from '@/config/navigation';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div className="flex items-center gap-2" key={`${item.label}-${index}`}>
            {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" /> : null}
            {item.href && !isLast ? (
              <Link className="transition-colors hover:text-foreground" to={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-foreground' : undefined}>{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}