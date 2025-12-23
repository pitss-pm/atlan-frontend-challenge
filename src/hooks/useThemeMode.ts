import { useCallback, useMemo } from 'react';
import { lightTheme, darkTheme } from '../theme';
import type { ThemeMode } from '../theme';
import { useLocalStorage } from './useLocalStorage';

export function useThemeMode() {
  const [mode, setMode] = useLocalStorage<ThemeMode>('sql_runner_theme','light');

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [setMode]);

  const theme = useMemo(() => {
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [mode]);

  return {
    mode,
    theme,
    toggleTheme,
    setMode,
  };
}
