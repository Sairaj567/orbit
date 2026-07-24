import { create } from 'zustand';

interface AccessibilityState {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  setReducedMotion: (reducedMotion: boolean) => void;
  setHighContrast: (highContrast: boolean) => void;
  setFontSize: (fontSize: 'sm' | 'md' | 'lg') => void;
}

export const useAccessibilityStore = create<AccessibilityState>((set) => ({
  reducedMotion: false,
  highContrast: false,
  fontSize: 'md',
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setHighContrast: (highContrast) => set({ highContrast }),
  setFontSize: (fontSize) => set({ fontSize }),
}));