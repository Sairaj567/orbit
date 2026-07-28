import { apiClient } from '@/lib/api-client';
import type { Task, HabitDTO, StudyBlockDTO } from '@orbit/shared';

export interface CalendarEvents {
  tasks: Task[];
  habits: HabitDTO[];
  studyBlocks: StudyBlockDTO[];
}

export class CalendarClient {
  static async getEvents(
    workspaceId: string,
    startDate: string,
    endDate: string,
  ): Promise<CalendarEvents> {
    const res = await apiClient<CalendarEvents>(
      `/api/v1/workspaces/${workspaceId}/calendar?startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
      },
    );
    return res;
  }
}
