import { createContext, useContext } from 'react';
import type { WorkspaceOption } from '@/config/navigation';

export interface WorkspaceContextValue {
  workspace: WorkspaceOption;
  workspaces: WorkspaceOption[];
  loading: boolean;
  setWorkspaceSlug: (workspaceSlug: string) => void;
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspaceContext(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error('useWorkspaceContext must be used within WorkspaceLayout');
  }

  return context;
}
