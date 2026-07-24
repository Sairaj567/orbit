import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundState {
  enabled: boolean;
  volume: number;
  ui: boolean;
  achievement: boolean;
  notification: boolean;
  timer: boolean;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setCategoryEnabled: (category: 'ui' | 'achievement' | 'notification' | 'timer', enabled: boolean) => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      enabled: true,
      volume: 0.7,
      ui: true,
      achievement: true,
      notification: true,
      timer: true,
      setEnabled: (enabled) => set({ enabled }),
      setVolume: (volume) => set({ volume }),
      setCategoryEnabled: (category, enabled) => set({ [category]: enabled } as Pick<SoundState, 'ui' | 'achievement' | 'notification' | 'timer'>),
    }),
    {
      name: 'orbit-sound',
      partialize: (state) => ({
        enabled: state.enabled,
        volume: state.volume,
        ui: state.ui,
        achievement: state.achievement,
        notification: state.notification,
        timer: state.timer,
      }),
    },
  ),
);