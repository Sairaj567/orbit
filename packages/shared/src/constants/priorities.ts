import type { Priority } from '../types/enums.js';

export interface PriorityMeta {
  label: string;
  color: string;
  icon: string;
  sortWeight: number;
}

export const PRIORITY_META: Record<Priority, PriorityMeta> = {
  LOW: {
    label: 'Low',
    color: '#94a3b8',
    icon: 'ArrowDown',
    sortWeight: 3,
  },
  MEDIUM: {
    label: 'Medium',
    color: '#3b82f6',
    icon: 'Minus',
    sortWeight: 2,
  },
  HIGH: {
    label: 'High',
    color: '#f97316',
    icon: 'ArrowUp',
    sortWeight: 1,
  },
  URGENT: {
    label: 'Urgent',
    color: '#ef4444',
    icon: 'AlertCircle',
    sortWeight: 0,
  },
};
