import { z } from 'zod';
import { StudyBlockStatus } from './enums';

export const CreateStudyBlockSchema = z.object({
  projectId: z.string(),
  taskId: z.string().optional().nullable(),
  habitId: z.string().optional().nullable(),
  plannedDuration: z.number().int().min(1).default(25),
});

export type CreateStudyBlockInput = z.infer<typeof CreateStudyBlockSchema>;

export const UpdateStudyBlockSchema = z.object({
  notes: z.string().optional().nullable(),
  actualDuration: z.number().int().optional().nullable(),
});

export type UpdateStudyBlockInput = z.infer<typeof UpdateStudyBlockSchema>;

export const CompleteStudyBlockSchema = z.object({
  notes: z.string().optional().nullable(),
  actualDuration: z.number().int().min(0),
});

export type CompleteStudyBlockInput = z.infer<typeof CompleteStudyBlockSchema>;

export interface StudyBlockDTO {
  id: string;
  workspaceId: string;
  projectId: string;
  taskId: string | null;
  habitId: string | null;
  userId: string;
  status: StudyBlockStatus;
  plannedDuration: number;
  actualDuration: number | null;
  startedAt: Date | string;
  endedAt: Date | string | null;
  notes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
