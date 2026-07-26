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
  return (
    <ClerkProvider publishableKey={env.clerkPublishableKey}>
      <ThemeProvider>
        <QueryProvider>
          <ToastProvider>
            <RealtimeProvider>{children}</RealtimeProvider>
          </ToastProvider>
        </QueryProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
