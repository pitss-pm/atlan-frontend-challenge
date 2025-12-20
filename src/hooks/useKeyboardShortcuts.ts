import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onRunQuery?: () => void;
  onSaveQuery?: () => void;
  onToggleComment?: () => void;
  onNewTab?: () => void;
  onCloseTab?: () => void;
}

export function useKeyboardShortcuts({
  onRunQuery,
  onSaveQuery,
  onToggleComment,
  onNewTab,
  onCloseTab,
}: ShortcutHandlers) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMod = event.metaKey || event.ctrlKey;

      if (isMod && event.key === 'Enter') {
        event.preventDefault();
        onRunQuery?.();
        return;
      }

      if (isMod && event.key === 's') {
        event.preventDefault();
        onSaveQuery?.();
        return;
      }

      if (isMod && event.key === '/') {
        onToggleComment?.();
        return;
      }

      if (isMod && event.key === 't') {
        event.preventDefault();
        onNewTab?.();
        return;
      }

      if (isMod && event.key === 'w') {
        event.preventDefault();
        onCloseTab?.();
        return;
      }
    },
    [onRunQuery, onSaveQuery, onToggleComment, onNewTab, onCloseTab]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function formatShortcut(shortcut: string): string {
  const isMac =
    typeof navigator !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return shortcut
    .replace('Mod', isMac ? '⌘' : 'Ctrl')
    .replace('Ctrl', isMac ? '⌘' : 'Ctrl')
    .replace('Alt', isMac ? '⌥' : 'Alt')
    .replace('Shift', isMac ? '⇧' : 'Shift');
}
