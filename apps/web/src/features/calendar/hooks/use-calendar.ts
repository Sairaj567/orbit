import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClient } from '../api/calendar.client';
import { useRealtime } from '@/providers/realtime-provider';
import { useEffect } from 'react';

export function useCalendar(workspaceId: string, startDate: string, endDate: string) {
  const { subscribe } = useRealtime();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubTaskC = subscribe('task.created', () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', workspaceId] });
    });
    const unsubTaskU = subscribe('task.updated', () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', workspaceId] });
    });
    const unsubTaskD = subscribe('task.deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', workspaceId] });
    });
    const unsubHabit = subscribe('habit.updated', () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', workspaceId] });
    });
    const unsubStudyC = subscribe('studyBlock.created', () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', workspaceId] });
    });
    const unsubStudyU = subscribe('studyBlock.updated', () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', workspaceId] });
    });

    return () => {
      unsubTaskC();
      unsubTaskU();
      unsubTaskD();
      unsubHabit();
      unsubStudyC();
      unsubStudyU();
    };
  }, [workspaceId, subscribe, queryClient]);

  return useQuery({
    queryKey: ['calendar', workspaceId, startDate, endDate],
    queryFn: async () => {
      return CalendarClient.getEvents(workspaceId, startDate, endDate);
    },
    enabled: !!workspaceId && !!startDate && !!endDate,
  });
}
