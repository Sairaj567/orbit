export const ROUTES = {
  home: '/w/:workspaceSlug',
  dashboard: '/w/:workspaceSlug/dashboard',
  tasks: '/w/:workspaceSlug/tasks',
  taskDetail: '/w/:workspaceSlug/tasks/:taskId',
  habits: '/w/:workspaceSlug/habits',
  study: '/w/:workspaceSlug/study',
  notes: '/w/:workspaceSlug/notes',
  calendar: '/w/:workspaceSlug/calendar',
  analytics: '/w/:workspaceSlug/analytics',
  achievements: '/w/:workspaceSlug/achievements',
  activity: '/w/:workspaceSlug/activity',
  settings: '/w/:workspaceSlug/settings',
  workspaceSettings: '/w/:workspaceSlug/workspace-settings',
  notFound: '*',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];