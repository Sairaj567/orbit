import { useCallback } from 'react';
import { soundEngine } from '@/lib/sounds';
import { useSoundStore } from '@/stores/sound.store';

export function useSound() {
  const enabled = useSoundStore((state) => state.enabled);
  const volume = useSoundStore((state) => state.volume);

  return useCallback(
    (name: string) => {
      if (!enabled) return;
      soundEngine.play(name, volume);
    },
    [enabled, volume],
  );
}