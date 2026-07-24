import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10 text-center">
      <div className="max-w-md space-y-5 rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
          <p className="text-sm leading-6 text-muted-foreground">The route you requested does not exist in this workspace shell.</p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:translate-y-[-1px]"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}