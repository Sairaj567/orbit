// Central React Query key factory

export const queryKeys = {
  workspaces: {
    all: ['workspaces'] as const,
    detail: (workspaceId: string) => ['workspaces', workspaceId] as const,
    activity: (workspaceId: string) =>
      [...queryKeys.workspaces.detail(workspaceId), 'activity'] as const,
  },

  projects: {
    all: (workspaceId: string) =>
      [...queryKeys.workspaces.detail(workspaceId), 'projects'] as const,
    list: (workspaceId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.projects.all(workspaceId), { ...filters }] as const,
    detail: (workspaceId: string, projectId: string) =>
      [...queryKeys.projects.all(workspaceId), projectId] as const,
    activity: (workspaceId: string, projectId: string) =>
      [...queryKeys.projects.detail(workspaceId, projectId), 'activity'] as const,
  },

  tasks: {
    all: (workspaceId: string) => [...queryKeys.workspaces.detail(workspaceId), 'tasks'] as const,
    list: (workspaceId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.tasks.all(workspaceId), { ...filters }] as const,
    detail: (workspaceId: string, taskId: string) =>
      [...queryKeys.tasks.all(workspaceId), taskId] as const,
  },

  habits: {
    all: (workspaceId: string) => [...queryKeys.workspaces.detail(workspaceId), 'habits'] as const,
    list: (workspaceId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.habits.all(workspaceId), { ...filters }] as const,
    detail: (workspaceId: string, habitId: string) =>
      [...queryKeys.habits.all(workspaceId), habitId] as const,
  },

  notes: {
    all: (workspaceId: string) => [...queryKeys.workspaces.detail(workspaceId), 'notes'] as const,
    list: (workspaceId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.notes.all(workspaceId), { ...filters }] as const,
    detail: (workspaceId: string, noteId: string) =>
      [...queryKeys.notes.all(workspaceId), noteId] as const,
  },

  resources: {
    all: (workspaceId: string) =>
      [...queryKeys.workspaces.detail(workspaceId), 'resources'] as const,
    list: (workspaceId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.resources.all(workspaceId), { ...filters }] as const,
    detail: (workspaceId: string, resourceId: string) =>
      [...queryKeys.resources.all(workspaceId), resourceId] as const,
  },

  studyBlocks: {
    all: (workspaceId: string) =>
      [...queryKeys.workspaces.detail(workspaceId), 'studyBlocks'] as const,
    active: (workspaceId: string) => [...queryKeys.studyBlocks.all(workspaceId), 'active'] as const,
    list: (workspaceId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.studyBlocks.all(workspaceId), { ...filters }] as const,
    detail: (workspaceId: string, studyBlockId: string) =>
      [...queryKeys.studyBlocks.all(workspaceId), studyBlockId] as const,
  },

  members: {
    all: (workspaceId: string) => [...queryKeys.workspaces.detail(workspaceId), 'members'] as const,
  },

  dashboard: {
    all: (workspaceId: string) =>
      [...queryKeys.workspaces.detail(workspaceId), 'dashboard'] as const,
  },

  user: {
    me: ['user', 'me'] as const,
  },
};
