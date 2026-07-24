import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'violet' | 'blue' | 'green' | 'orange' | 'rose' | 'teal';
export type Density = 'comfortable' | 'compact';
export type Radius = 'sm' | 'md' | 'lg';
export type FontSize = 'sm' | 'md' | 'lg';
export type MotionLevel = 'full' | 'reduced' | 'none';

interface ThemeState {
  theme: ThemeMode;
  accentColor: AccentColor;
  density: Density;
  radius: Radius;
  fontSize: FontSize;
  motionLevel: MotionLevel;
  setTheme: (theme: ThemeMode) => void;
  setAccentColor: (accentColor: AccentColor) => void;
  setDensity: (density: Density) => void;
  setRadius: (radius: Radius) => void;
  setFontSize: (fontSize: FontSize) => void;
  setMotionLevel: (motionLevel: MotionLevel) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      accentColor: 'violet',
      density: 'comfortable',
      radius: 'lg',
      fontSize: 'md',
      motionLevel: 'full',
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setDensity: (density) => set({ density }),
      setRadius: (radius) => set({ radius }),
      setFontSize: (fontSize) => set({ fontSize }),
      setMotionLevel: (motionLevel) => set({ motionLevel }),
    }),
    {
      name: 'orbit-theme',
      partialize: (state) => ({
        theme: state.theme,
        accentColor: state.accentColor,
        density: state.density,
        radius: state.radius,
        fontSize: state.fontSize,
        motionLevel: state.motionLevel,
      }),
    },
  ),
);