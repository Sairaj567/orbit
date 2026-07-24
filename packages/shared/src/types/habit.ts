import { z } from 'zod';

export const CreateHabitSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  rrule: z.string().optional(),
  timezone: z.string().optional(),
  recurrenceType: z.enum(['FIXED', 'RELATIVE']).optional(),
});

export type CreateHabitInput = z.infer<typeof CreateHabitSchema>;

export const UpdateHabitSchema = CreateHabitSchema.partial().extend({
  archived: z.boolean().optional(),
});

export type UpdateHabitInput = z.infer<typeof UpdateHabitSchema>;

export interface HabitDTO {
  id: string;
  workspaceId: string;
  projectId: string;
  title: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  rrule: string | null;
  timezone: string | null;
  recurrenceType: 'FIXED' | 'RELATIVE' | null;
  streak: number;
  longestStreak: number;
  completionCount: number;
  lastCompletedAt: Date | string | null;
  archived: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
