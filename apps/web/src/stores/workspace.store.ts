import { create } from 'zustand';

interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceState {
  currentWorkspaceId: string | null;
  workspaces: WorkspaceSummary[];
  setCurrentWorkspaceId: (workspaceId: string | null) => void;
  setWorkspaces: (workspaces: WorkspaceSummary[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspaceId: null,
  workspaces: [],
  setCurrentWorkspaceId: (currentWorkspaceId) => set({ currentWorkspaceId }),
  setWorkspaces: (workspaces) => set({ workspaces }),
}));