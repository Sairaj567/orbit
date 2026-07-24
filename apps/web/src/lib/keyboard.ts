export interface KeyboardShortcut {
  keys: string[];
  handler: () => void;
}

export function registerKeyboardShortcut(shortcut: KeyboardShortcut): () => void {
  const listener = (event: KeyboardEvent) => {
    const [firstKey, secondKey] = shortcut.keys;

    if (shortcut.keys.length === 1 && firstKey && event.key.toLowerCase() === firstKey.toLowerCase()) {
      shortcut.handler();
      return;
    }

    if (shortcut.keys.length === 2 && secondKey && event.ctrlKey && event.key.toLowerCase() === secondKey.toLowerCase()) {
      shortcut.handler();
    }
  };

  window.addEventListener('keydown', listener);
  return () => window.removeEventListener('keydown', listener);
}