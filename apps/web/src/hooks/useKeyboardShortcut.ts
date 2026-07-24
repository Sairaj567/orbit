import { useEffect } from 'react';
import { registerKeyboardShortcut } from '@/lib/keyboard';

interface KeyboardShortcutOptions {
  keys: string[];
  handler: () => void;
}

export function useKeyboardShortcut({ keys, handler }: KeyboardShortcutOptions): void {
  useEffect(() => registerKeyboardShortcut({ keys, handler }), [handler, keys]);
}