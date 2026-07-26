import { create } from 'zustand';

interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
}

interface WorkspaceState {
  currentWorkspaceId: string | null;
  currentWorkspaceSlug: string | null;
  workspaces: WorkspaceSummary[];
  setCurrentWorkspaceId: (workspaceId: string | null) => void;
  setCurrentWorkspaceSlug: (workspaceSlug: string | null) => void;
  setWorkspaces: (workspaces: WorkspaceSummary[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspaceId: null,
  currentWorkspaceSlug: null,
  workspaces: [],
  setCurrentWorkspaceId: (currentWorkspaceId) => set({ currentWorkspaceId }),
  setCurrentWorkspaceSlug: (currentWorkspaceSlug) => set({ currentWorkspaceSlug }),
  setWorkspaces: (workspaces) => set({ workspaces }),
}));
