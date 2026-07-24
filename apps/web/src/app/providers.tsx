import type { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { QueryProvider } from '@/providers/query-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { RealtimeProvider } from '@/providers/realtime-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_missing';
  
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
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