import type { Priority } from '@orbit/shared';
import { PRIORITY_META } from '@orbit/shared';

export function getPriorityLabel(priority: Priority): string {
  return PRIORITY_META[priority].label;
}

export function getPrioritySortWeight(priority: Priority): number {
  return PRIORITY_META[priority].sortWeight;
}

export function getPriorityColor(priority: Priority): string {
  return PRIORITY_META[priority].color;
}