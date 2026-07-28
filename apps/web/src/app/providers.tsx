import type { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryProvider } from '@/providers/query-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { RealtimeProvider } from '@/providers/realtime-provider';
import { env } from '@/config/env';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const innerProviders = (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          <RealtimeProvider>{children}</RealtimeProvider>
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );

  if (env.authMode === 'clerk') {
    return <ClerkProvider publishableKey={env.clerkPublishableKey}>{innerProviders}</ClerkProvider>;
  }

  return innerProviders;
}
