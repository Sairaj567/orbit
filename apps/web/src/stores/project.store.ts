import { create } from 'zustand';

interface ProjectState {
  currentProjectId: string | null;
  setCurrentProjectId: (projectId: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProjectId: null,
  setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),
}));
