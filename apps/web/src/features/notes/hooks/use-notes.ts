import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotesClient } from '../api/notes.client';
import type { CreateNoteInput, UpdateNoteInput, NoteQueryInput } from '@orbit/shared';
import { queryKeys } from '@/lib/query-keys';
import { useRealtime } from '@/providers/realtime-provider';
import { useEffect } from 'react';

export function useNotes(workspaceId: string, query?: NoteQueryInput) {
  const { subscribe } = useRealtime();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubCreated = subscribe('note.created', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all(workspaceId) });
    });
    const unsubUpdated = subscribe('note.updated', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all(workspaceId) });
    });
    const unsubDeleted = subscribe('note.deleted', () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all(workspaceId) });
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [workspaceId, subscribe, queryClient]);

  return useQuery({
    queryKey: queryKeys.notes.list(workspaceId, query),
    queryFn: async () => {
      return NotesClient.findAll(workspaceId, query);
    },
    enabled: !!workspaceId,
  });
}

export function useNote(workspaceId: string, noteId: string) {
  return useQuery({
    queryKey: queryKeys.notes.detail(workspaceId, noteId),
    queryFn: async () => {
      return NotesClient.findOne(workspaceId, noteId);
    },
    enabled: !!workspaceId && !!noteId,
  });
}

export function useCreateNote(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNoteInput) => {
      return NotesClient.create(workspaceId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all(workspaceId) });
    },
  });
}

export function useUpdateNote(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateNoteInput }) => {
      return NotesClient.update(workspaceId, id, data);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notes.all(workspaceId) });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all(workspaceId) });
    },
  });
}

export function useDeleteNote(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return NotesClient.delete(workspaceId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all(workspaceId) });
    },
  });
}
