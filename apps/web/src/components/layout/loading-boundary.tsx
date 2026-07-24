import type { ReactNode } from 'react';
import { Suspense } from 'react';

interface LoadingBoundaryProps {
  children: ReactNode;
}

function LoadingFallback() {
  return <div className="min-h-[240px] animate-pulse rounded-[2rem] border border-border/70 bg-muted/40" />;
}

export function LoadingBoundary({ children }: LoadingBoundaryProps) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}