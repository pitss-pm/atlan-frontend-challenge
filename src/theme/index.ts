import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

const palette = {
  primary: {
    main: '#0d9488',
    light: '#2dd4bf',
    dark: '#0f766e',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#1f2937',
  },
  success: {
    main: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
  },
};

const typography = {
  fontFamily: '"Outfit", "Segoe UI", Roboto, sans-serif',
  h1: {
    fontWeight: 600,
    fontSize: '2rem',
  },
  h2: {
    fontWeight: 600,
    fontSize: '1.5rem',
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.25rem',
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.125rem',
  },
  h5: {
    fontWeight: 600,
    fontSize: '1rem',
  },
  h6: {
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 500,
  },
};

const components: ThemeOptions['components'] = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '8px 16px',
      },
    },
    defaultProps: {
      disableElevation: true,
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        minHeight: 42,
        fontWeight: 500,
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: 42,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 6,
        fontSize: '0.75rem',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...palette,
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
  },
  typography,
  components,
  shape: {
    borderRadius: 8,
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...palette,
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    divider: '#334155',
  },
  typography,
  components: {
    ...components,
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export type ThemeMode = 'light' | 'dark';

