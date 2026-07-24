import { apiClient } from '@/lib/api-client';
import type { StudyBlockDTO, CreateStudyBlockInput, UpdateStudyBlockInput, CompleteStudyBlockInput } from '@orbit/shared';

export class StudyBlocksClient {
  static async getActive(workspaceId: string, token: string): Promise<StudyBlockDTO | null> {
    try {
      return await apiClient<StudyBlockDTO>(`/api/v1/workspaces/${workspaceId}/study-blocks/active`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      // If none active, it might return 404 depending on the backend, or just null/empty.
      // Assuming empty return if none active based on Prisma findFirst.
      return null;
    }
  }

  static async create(workspaceId: string, data: CreateStudyBlockInput, token: string): Promise<StudyBlockDTO> {
    return apiClient<StudyBlockDTO>(`/api/v1/workspaces/${workspaceId}/study-blocks`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  static async update(workspaceId: string, studyBlockId: string, data: UpdateStudyBlockInput, token: string): Promise<StudyBlockDTO> {
    return apiClient<StudyBlockDTO>(`/api/v1/workspaces/${workspaceId}/study-blocks/${studyBlockId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  static async complete(workspaceId: string, studyBlockId: string, data: CompleteStudyBlockInput, token: string): Promise<StudyBlockDTO> {
    return apiClient<StudyBlockDTO>(`/api/v1/workspaces/${workspaceId}/study-blocks/${studyBlockId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  static async cancel(workspaceId: string, studyBlockId: string, token: string): Promise<StudyBlockDTO> {
    return apiClient<StudyBlockDTO>(`/api/v1/workspaces/${workspaceId}/study-blocks/${studyBlockId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
