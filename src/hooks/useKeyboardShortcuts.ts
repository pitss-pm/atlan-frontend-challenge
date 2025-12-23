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
      const key = event.key.toLowerCase();

      if (isMod && event.key === 'Enter') {
        if (onRunQuery) {
          event.preventDefault();
          event.stopPropagation();
          onRunQuery();
        }
        return;
      }

      if (isMod && key === 's') {
        if (onSaveQuery) {
          event.preventDefault();
          event.stopPropagation();
          onSaveQuery();
        }
        return;
      }

      if (isMod && key === '/') {
        if (onToggleComment) {
          event.preventDefault();
          event.stopPropagation();
          onToggleComment();
        }
        return;
      }

      if (isMod && key === 't') {
        if (onNewTab) {
          event.preventDefault();
          event.stopPropagation();
          onNewTab();
        }
        return;
      }

      if (isMod && key === 'w') {
        if (onCloseTab) {
          event.preventDefault();
          event.stopPropagation();
          onCloseTab();
        }
        return;
      }
    },
    [onRunQuery, onSaveQuery, onToggleComment, onNewTab, onCloseTab]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
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
