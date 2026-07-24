import type { ReactNode } from 'react';

interface ContentLayoutProps {
  children: ReactNode;
}

export function ContentLayout({ children }: ContentLayoutProps) {
  return <div className="mx-auto w-full max-w-7xl">{children}</div>;
}