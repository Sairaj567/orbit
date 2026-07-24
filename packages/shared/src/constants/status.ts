import type { TaskStatus } from '../types/enums.js';

export interface StatusMeta {
  label: string;
  color: string;
  icon: string;
  isTerminal: boolean;
}

export const TASK_STATUS_META: Record<TaskStatus, StatusMeta> = {
  TODO: {
    label: 'To Do',
    color: '#94a3b8',
    icon: 'Circle',
    isTerminal: false,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: '#3b82f6',
    icon: 'Clock',
    isTerminal: false,
  },
  IN_REVIEW: {
    label: 'In Review',
    color: '#eab308',
    icon: 'Eye',
    isTerminal: false,
  },
  DONE: {
    label: 'Done',
    color: '#22c55e',
    icon: 'CheckCircle',
    isTerminal: true,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: '#ef4444',
    icon: 'XCircle',
    isTerminal: true,
  },
  SKIPPED: {
    label: 'Skipped',
    color: '#8b5cf6',
    icon: 'SkipForward',
    isTerminal: true,
  },
};
