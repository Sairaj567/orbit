import { apiClient } from '@/lib/api-client';
import type { Note } from '@orbit/shared';
import type { CreateNoteInput, UpdateNoteInput, NoteQueryInput } from '@orbit/shared';

export const NotesClient = {
  findAll: async (workspaceId: string, query: NoteQueryInput = {}, token: string) => {
    const params = new URLSearchParams();
    if (query?.projectId) params.append('projectId', query.projectId);
    if (query?.taskId) params.append('taskId', query.taskId);
    if (query?.isPinned !== undefined) params.append('isPinned', String(query.isPinned));
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient<{ data: Note[] }>(`/api/v1/workspaces/${workspaceId}/notes${queryString}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  findOne: async (workspaceId: string, id: string, token: string) => {
    return apiClient<{ data: Note }>(`/api/v1/workspaces/${workspaceId}/notes/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  create: async (workspaceId: string, data: CreateNoteInput, token: string) => {
    return apiClient<{ data: Note }>(`/api/v1/workspaces/${workspaceId}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  update: async (workspaceId: string, id: string, data: UpdateNoteInput, token: string) => {
    return apiClient<{ data: Note }>(`/api/v1/workspaces/${workspaceId}/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },

  delete: async (workspaceId: string, id: string, token: string) => {
    return apiClient<void>(`/api/v1/workspaces/${workspaceId}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
};
