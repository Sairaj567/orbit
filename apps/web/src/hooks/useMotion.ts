import { useThemeStore } from '@/stores/theme.store';

export function useMotion() {
  const motionLevel = useThemeStore((state) => state.motionLevel);

  return {
    motionLevel,
    enabled: motionLevel !== 'none',
    reduced: motionLevel === 'reduced',
  };
}