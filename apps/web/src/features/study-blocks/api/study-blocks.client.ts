import { apiClient } from '@/lib/api-client';
import type {
  StudyBlockDTO,
  CreateStudyBlockInput,
  UpdateStudyBlockInput,
  CompleteStudyBlockInput,
  ApiResponse,
} from '@orbit/shared';

export class StudyBlocksClient {
  static async getActive(workspaceId: string): Promise<StudyBlockDTO | null> {
    try {
      const res = await apiClient<ApiResponse<StudyBlockDTO | null>>(
        `/api/v1/workspaces/${workspaceId}/study-blocks/active`,
        {
          method: 'GET',
        },
      );
      return res.data;
    } catch {
      return null;
    }
  }

  static async getHistory(workspaceId: string): Promise<StudyBlockDTO[]> {
    const res = await apiClient<ApiResponse<StudyBlockDTO[]>>(
      `/api/v1/workspaces/${workspaceId}/study-blocks/history`,
      {
        method: 'GET',
      },
    );
    return res.data;
  }

  static async create(workspaceId: string, data: CreateStudyBlockInput): Promise<StudyBlockDTO> {
    const res = await apiClient<ApiResponse<StudyBlockDTO>>(
      `/api/v1/workspaces/${workspaceId}/study-blocks`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    return res.data;
  }

  static async update(
    workspaceId: string,
    studyBlockId: string,
    data: UpdateStudyBlockInput,
  ): Promise<StudyBlockDTO> {
    const res = await apiClient<ApiResponse<StudyBlockDTO>>(
      `/api/v1/workspaces/${workspaceId}/study-blocks/${studyBlockId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    );
    return res.data;
  }

  static async complete(
    workspaceId: string,
    studyBlockId: string,
    data: CompleteStudyBlockInput,
  ): Promise<StudyBlockDTO> {
    const res = await apiClient<ApiResponse<StudyBlockDTO>>(
      `/api/v1/workspaces/${workspaceId}/study-blocks/${studyBlockId}/complete`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    return res.data;
  }

  static async cancel(workspaceId: string, studyBlockId: string): Promise<StudyBlockDTO> {
    const res = await apiClient<ApiResponse<StudyBlockDTO>>(
      `/api/v1/workspaces/${workspaceId}/study-blocks/${studyBlockId}/cancel`,
      {
        method: 'POST',
      },
    );
    return res.data;
  }
}
