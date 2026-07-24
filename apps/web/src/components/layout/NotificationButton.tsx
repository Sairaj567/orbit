import { Bell } from 'lucide-react';

interface NotificationButtonProps {
  count?: number;
  onClick?: () => void;
}

export function NotificationButton({ count = 0, onClick }: NotificationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:shadow-lg hover:shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
    >
      <Bell className="h-4.5 w-4.5" aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
          {count}
        </span>
      ) : null}
    </button>
  );
}