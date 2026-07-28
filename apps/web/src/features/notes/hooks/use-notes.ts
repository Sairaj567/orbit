import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-hooks';
import { NotesClient } from '../api/notes.client';
import type { CreateNoteInput, UpdateNoteInput, NoteQueryInput } from '@orbit/shared';

export function useNotes(workspaceId: string, query?: NoteQueryInput) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['workspaces', workspaceId, 'notes', query],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return NotesClient.findAll(workspaceId, query, token);
    },
    enabled: !!workspaceId,
  });
}

export function useNote(workspaceId: string, noteId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['workspaces', workspaceId, 'notes', noteId],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return NotesClient.findOne(workspaceId, noteId, token);
    },
    enabled: !!workspaceId && !!noteId,
  });
}

export function useCreateNote(workspaceId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNoteInput) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return NotesClient.create(workspaceId, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'notes'] });
    },
  });
}

export function useUpdateNote(workspaceId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateNoteInput }) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return NotesClient.update(workspaceId, id, data, token);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['workspaces', workspaceId, 'notes'] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'notes'] });
    },
  });
}

export function useDeleteNote(workspaceId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return NotesClient.delete(workspaceId, id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'notes'] });
    },
  });
}
