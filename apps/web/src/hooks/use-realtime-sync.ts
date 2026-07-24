import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from './use-realtime';

export function useRealtimeSync() {
  const { subscribe } = useRealtime();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubProjectCreated = subscribe('project.created', () => queryClient.invalidateQueries({ queryKey: ['projects'] }));
    const unsubProjectUpdated = subscribe('project.updated', (eventData) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', (eventData.payload as unknown as { id: string }).id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });
    const unsubProjectDeleted = subscribe('project.deleted', (eventData) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', (eventData.payload as unknown as { id: string }).id] });
    });

    const unsubTaskCreated = subscribe('task.created', () => queryClient.invalidateQueries({ queryKey: ['tasks'] }));
    const unsubTaskUpdated = subscribe('task.updated', (eventData) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', (eventData.payload as unknown as { id: string }).id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });
    const unsubTaskDeleted = subscribe('task.deleted', (eventData) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', (eventData.payload as unknown as { id: string }).id] });
    });

    const unsubNoteCreated = subscribe('note.created', () => queryClient.invalidateQueries({ queryKey: ['notes'] }));
    const unsubNoteUpdated = subscribe('note.updated', (eventData) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes', (eventData.payload as unknown as { id: string }).id] });
    });
    const unsubNoteDeleted = subscribe('note.deleted', (eventData) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes', (eventData.payload as unknown as { id: string }).id] });
    });

    const unsubResourceCreated = subscribe('resource.created', () => queryClient.invalidateQueries({ queryKey: ['resources'] }));
    const unsubResourceUpdated = subscribe('resource.updated', (eventData) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources', (eventData.payload as unknown as { id: string }).id] });
    });
    const unsubResourceDeleted = subscribe('resource.deleted', (eventData) => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources', (eventData.payload as unknown as { id: string }).id] });
    });
    
    const unsubMemberCreated = subscribe('member.created', () => queryClient.invalidateQueries({ queryKey: ['members'] }));
    const unsubMemberUpdated = subscribe('member.updated', () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    });
    const unsubMemberDeleted = subscribe('member.deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    });

    const unsubActivityCreated = subscribe('activity.created', () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    const unsubStudyBlockCreated = subscribe('studyBlock.created', () => queryClient.invalidateQueries({ queryKey: ['study-blocks'] }));
    const unsubStudyBlockUpdated = subscribe('studyBlock.updated', () => {
      queryClient.invalidateQueries({ queryKey: ['study-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    return () => {
      unsubProjectCreated();
      unsubProjectUpdated();
      unsubProjectDeleted();
      unsubTaskCreated();
      unsubTaskUpdated();
      unsubTaskDeleted();
      unsubNoteCreated();
      unsubNoteUpdated();
      unsubNoteDeleted();
      unsubResourceCreated();
      unsubResourceUpdated();
      unsubResourceDeleted();
      unsubMemberCreated();
      unsubMemberUpdated();
      unsubMemberDeleted();
      unsubActivityCreated();
      unsubStudyBlockCreated();
      unsubStudyBlockUpdated();
    };
  }, [subscribe, queryClient]);
}
