import { apiClient } from '@/lib/api-client';
import type {
  StudyBlockDTO,
  CreateStudyBlockInput,
  UpdateStudyBlockInput,
  CompleteStudyBlockInput,
  ApiResponse,
} from '@orbit/shared';

export class StudyBlocksClient {
  static async getActive(workspaceId: string, token: string): Promise<StudyBlockDTO | null> {
    try {
      const res = await apiClient<ApiResponse<StudyBlockDTO | null>>(
        `/api/v1/workspaces/${workspaceId}/study-blocks/active`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data;
    } catch {
      return null;
    }
  }

  static async create(
    workspaceId: string,
    data: CreateStudyBlockInput,
    token: string,
  ): Promise<StudyBlockDTO> {
    const res = await apiClient<ApiResponse<StudyBlockDTO>>(
      `/api/v1/workspaces/${workspaceId}/study-blocks`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }

  static async update(
    workspaceId: string,
    studyBlockId: string,
    data: UpdateStudyBlockInput,
    token: string,
  ): Promise<StudyBlockDTO> {
    const res = await apiClient<ApiResponse<StudyBlockDTO>>(
      `/api/v1/workspaces/${workspaceId}/study-blocks/${studyBlockId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }

  static async complete(
    workspaceId: string,
    studyBlockId: string,
    data: CompleteStudyBlockInput,
    token: string,
  ): Promise<StudyBlockDTO> {
    const res = await apiClient<ApiResponse<StudyBlockDTO>>(
      `/api/v1/workspaces/${workspaceId}/study-blocks/${studyBlockId}/complete`,
      {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }

  static async cancel(
    workspaceId: string,
    studyBlockId: string,
    token: string,
  ): Promise<StudyBlockDTO> {
    const res = await apiClient<ApiResponse<StudyBlockDTO>>(
      `/api/v1/workspaces/${workspaceId}/study-blocks/${studyBlockId}/cancel`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }
}
