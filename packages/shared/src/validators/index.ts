import { z } from 'zod';
import { VISIBILITIES, RECURRENCE_TYPES, PROJECT_STATUSES, RESOURCE_TYPES } from '../types/enums.js';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED', 'SKIPPED']);
export const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional().nullable(),
  status: taskStatusSchema.default('TODO'),
  priority: taskPrioritySchema.default('MEDIUM'),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedDuration: z.number().int().nonnegative().optional().nullable(),
  actualDuration: z.number().int().nonnegative().optional().nullable(),
  tags: z.array(z.string()).optional(),
  categoryId: z.string().cuid().optional().nullable(),
  projectId: z.string().cuid().optional().nullable(),
  assigneeIds: z.array(z.string().cuid()).optional(),
  rrule: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  recurrenceType: z.enum(RECURRENCE_TYPES).optional().nullable(),
  rootTaskId: z.string().cuid().optional().nullable(),
  nextOccurrenceId: z.string().cuid().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = paginationSchema.extend({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  search: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  tags: z.array(z.string()).optional(),
});




export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional().nullable(),
  icon: z.string().max(20).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  status: z.enum(PROJECT_STATUSES).default('ACTIVE'),
  visibility: z.enum(VISIBILITIES).default('WORKSPACE'),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  isArchived: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const projectQuerySchema = paginationSchema.extend({
  status: z.enum(PROJECT_STATUSES).optional(),
  visibility: z.enum(VISIBILITIES).optional(),
  isArchived: z.boolean().optional(),
  search: z.string().optional(),
});

export const createResourceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  url: z.string().url(),
  type: z.enum(RESOURCE_TYPES).optional(),
  metadata: z.record(z.any()).optional().nullable(),
  projectId: z.string().cuid().optional().nullable(),
  taskId: z.string().cuid().optional().nullable(),
});

export const updateResourceSchema = createResourceSchema.partial();

export const resourceQuerySchema = paginationSchema.extend({
  projectId: z.string().cuid().optional(),
  taskId: z.string().cuid().optional(),
});

export type ResourceQueryInput = z.infer<typeof resourceQuerySchema>;

// ─── Note Schemas ──────────────────────────────────────────

export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  content: z.string().default(""),
  isPinned: z.boolean().default(false),
  projectId: z.string().cuid(),
  taskId: z.string().cuid().optional().nullable(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = createNoteSchema.partial().extend({
  order: z.number().int().optional(),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export const noteQuerySchema = z.object({
  projectId: z.string().cuid().optional(),
  taskId: z.string().cuid().optional(),
  isPinned: z.boolean().optional(),
});

export type NoteQueryInput = z.infer<typeof noteQuerySchema>;

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
