const PRIORITY_PALETTE = {
  critical: 'oklch(0.60 0.22 25)',
  high: 'oklch(0.70 0.18 50)',
  medium: 'oklch(0.80 0.16 85)',
  low: 'oklch(0.65 0.18 155)',
  optional: 'oklch(0.55 0.02 260)',
} as const;

export type PriorityTone = keyof typeof PRIORITY_PALETTE;

export function getPriorityColor(priority: PriorityTone): string {
  return PRIORITY_PALETTE[priority];
}

export function getAvatarColor(seed: string): string {
  const hues = [250, 285, 340, 155, 50, 195];
  const sum = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);
  return `oklch(0.65 0.18 ${hues[sum % hues.length]})`;
}