// ─── Workspace ───────────────────────────────────────

export const WORKSPACE_ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const;
export type Role = (typeof ROLES)[number];

// ─── Task ────────────────────────────────────────────

export const TASK_STATUSES = [
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
  'CANCELLED',
  'SKIPPED',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_TYPES = [
  'ONE_TIME',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY',
  'CUSTOM_RECURRING',
  'HABIT',
  'LONG_TERM_GOAL',
  'PROJECT',
  'MILESTONE',
  'STUDY_SESSION',
  'SHOPPING_ITEM',
  'CHORE',
] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const VISIBILITIES = ['WORKSPACE', 'PRIVATE', 'ASSIGNEES'] as const;
export type Visibility = (typeof VISIBILITIES)[number];

// ─── Recurrence ──────────────────────────────────────

export const RECURRENCE_TYPES = ['FIXED', 'RELATIVE'] as const;
export type RecurrenceType = (typeof RECURRENCE_TYPES)[number];

export const RECURRENCE_FREQUENCIES = [
  'DAILY',
  'WEEKDAYS',
  'WEEKENDS',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'YEARLY',
  'CUSTOM',
] as const;
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];

// ─── Resources ───────────────────────────────────────

export const RESOURCE_TYPES = [
  'WEBSITE',
  'GITHUB',
  'YOUTUBE',
  'PDF',
  'MARKDOWN',
] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

// ─── Notifications ───────────────────────────────────

export const NOTIFICATION_TYPES = ['BROWSER', 'PUSH', 'DISCORD', 'EMAIL'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// ─── Projects ────────────────────────────────────────

export const PROJECT_STATUSES = [
  'PLANNING',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

// ─── Study Block ─────────────────────────────────────

export const STUDY_BLOCK_STATUSES = ['RUNNING', 'COMPLETED', 'CANCELLED'] as const;
export type StudyBlockStatus = (typeof STUDY_BLOCK_STATUSES)[number];
