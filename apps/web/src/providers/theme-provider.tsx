import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme.store';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme !== 'light');
  }, [theme]);

  return <>{children}</>;
}