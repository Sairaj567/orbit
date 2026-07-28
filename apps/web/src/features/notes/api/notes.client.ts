import { apiClient } from '@/lib/api-client';
import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  NoteQueryInput,
  ApiResponse,
} from '@orbit/shared';

export const NotesClient = {
  findAll: async (
    workspaceId: string,
    query: NoteQueryInput = {},
  ): Promise<ApiResponse<Note[]>> => {
    return apiClient<ApiResponse<Note[]>>(`/api/v1/workspaces/${workspaceId}/notes`, {
      method: 'GET',
      params: query as Record<string, string | number | boolean | string[] | number[] | undefined>,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  findOne: async (workspaceId: string, id: string): Promise<ApiResponse<Note>> => {
    return apiClient<ApiResponse<Note>>(`/api/v1/workspaces/${workspaceId}/notes/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  create: async (workspaceId: string, data: CreateNoteInput): Promise<ApiResponse<Note>> => {
    return apiClient<ApiResponse<Note>>(`/api/v1/workspaces/${workspaceId}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  update: async (
    workspaceId: string,
    id: string,
    data: UpdateNoteInput,
  ): Promise<ApiResponse<Note>> => {
    return apiClient<ApiResponse<Note>>(`/api/v1/workspaces/${workspaceId}/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  delete: async (workspaceId: string, id: string): Promise<void> => {
    await apiClient(`/api/v1/workspaces/${workspaceId}/notes/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
