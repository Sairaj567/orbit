import { create } from 'zustand';
import type { StudyBlockDTO } from '@orbit/shared';

interface StudyBlockState {
  isPanelOpen: boolean;
  activeStudyBlock: StudyBlockDTO | null;
  setIsPanelOpen: (isOpen: boolean) => void;
  setActiveStudyBlock: (studyBlock: StudyBlockDTO | null) => void;
  togglePanel: () => void;
}

export const useStudyBlockStore = create<StudyBlockState>((set) => ({
  isPanelOpen: false,
  activeStudyBlock: null,
  setIsPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),
  setActiveStudyBlock: (studyBlock) => set({ activeStudyBlock: studyBlock }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
}));
