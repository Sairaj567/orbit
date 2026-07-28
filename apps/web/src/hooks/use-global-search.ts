import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Project, Task, Note, Resource, HabitDTO } from '@orbit/shared';

export type SearchResultType = 'project' | 'task' | 'note' | 'resource' | 'member' | 'habit';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  path: string;
  projectId?: string;
}

interface QueryData<T> {
  data?: T[];
}

export function useGlobalSearch(workspaceId: string, query: string) {
  const queryClient = useQueryClient();

  const results = useMemo(() => {
    if (!query || query.trim() === '')
      return { projects: [], tasks: [], notes: [], resources: [], members: [], habits: [] };

    const searchTerms = query.toLowerCase().split(' ').filter(Boolean);

    const match = (text?: string | null) => {
      if (!text) return false;
      const lower = text.toLowerCase();
      return searchTerms.every((term) => lower.includes(term));
    };

    // Helper to safely extract items from query cache
    const extractItems = <T extends { id: string }>(queryKey: unknown[]): T[] => {
      const queries = queryClient.getQueriesData<QueryData<T>>({ queryKey });
      const uniqueItems = new Map<string, T>();

      for (const [, data] of queries) {
        if (data && Array.isArray(data.data)) {
          for (const item of data.data) {
            uniqueItems.set(item.id, item);
          }
        }
      }

      return Array.from(uniqueItems.values());
    };

    // Get all items from cache
    const allProjects = extractItems<Project>(['projects', workspaceId, 'list']);
    const allTasks = extractItems<Task>(['tasks', workspaceId, 'list']);
    const allHabits = extractItems<HabitDTO>(['workspaces', workspaceId, 'habits']);
    const allNotes = extractItems<Note>(['workspaces', workspaceId, 'notes']);
    const allResources = extractItems<Resource>(['resources', workspaceId, 'list']);
    const allMembers = extractItems<{
      id: string;
      email?: string;
      role: string;
      user?: { displayName?: string };
    }>(['members', workspaceId]);

    // Create a set of project IDs the user currently has access to
    const activeProjectIds = new Set(allProjects.map((p) => p.id));

    // Filter and map to search results
    const projects: SearchResult[] = allProjects
      .filter((p) => match(p.name) || match(p.description))
      .map((p) => ({
        id: p.id,
        type: 'project',
        title: p.name,
        subtitle: p.description || undefined,
        path: `/w/${workspaceId}/projects/${p.id}/overview`,
      }));

    const tasks: SearchResult[] = allTasks
      .filter((t) => !t.projectId || activeProjectIds.has(t.projectId))
      .filter((t) => match(t.title) || match(t.description))
      .map((t) => ({
        id: t.id,
        type: 'task',
        title: t.title,
        subtitle: t.projectId ? `Project Task` : undefined,
        path: `/w/${workspaceId}/tasks/${t.id}`,
        projectId: t.projectId || undefined,
      }));

    const habits: SearchResult[] = allHabits
      .filter((h) => !h.projectId || activeProjectIds.has(h.projectId))
      .filter((h) => match(h.title) || match(h.description))
      .map((h) => ({
        id: h.id,
        type: 'habit',
        title: h.title,
        subtitle: h.description || undefined,
        path: h.projectId
          ? `/w/${workspaceId}/projects/${h.projectId}/habits`
          : `/w/${workspaceId}/habits`,
        projectId: h.projectId || undefined,
      }));

    const notes: SearchResult[] = allNotes
      .filter((n) => match(n.title) || match(n.content))
      .map((n) => ({
        id: n.id,
        type: 'note',
        title: n.title,
        subtitle: n.content
          ? n.content.length > 50
            ? n.content.substring(0, 50) + '...'
            : n.content
          : undefined,
        path: `/w/${workspaceId}/notes`,
        projectId: undefined,
      }));

    const resources: SearchResult[] = allResources
      .filter((r) => !r.projectId || activeProjectIds.has(r.projectId))
      .filter((r) => match(r.title) || match(r.url))
      .map((r) => ({
        id: r.id,
        type: 'resource',
        title: r.title,
        subtitle: r.url || undefined,
        path: r.projectId
          ? `/w/${workspaceId}/projects/${r.projectId}/resources`
          : `/w/${workspaceId}/dashboard`,
        projectId: r.projectId || undefined,
      }));

    const members: SearchResult[] = allMembers
      .filter((m) => match(m.user?.displayName) || match(m.email))
      .map((m) => ({
        id: m.id,
        type: 'member',
        title: m.user?.displayName || m.email || '',
        subtitle: m.role,
        path: `/w/${workspaceId}/workspace-settings`,
      }));

    return {
      projects,
      tasks,
      habits,
      notes,
      resources,
      members,
    };
  }, [queryClient, workspaceId, query]);

  return results;
}
