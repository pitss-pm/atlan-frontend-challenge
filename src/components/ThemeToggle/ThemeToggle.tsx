import React, { memo } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import type { ThemeMode } from '../../theme';

interface ThemeToggleProps {
  mode: ThemeMode;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = memo(({ mode, onToggle }) => {
  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton onClick={onToggle} color="primary" size="small" sx={{ color: 'primary.main', '&:hover': { color: 'primary.dark' } }}>
        {mode === 'light' ? (
          <DarkModeIcon fontSize="small" />
        ) : (
          <LightModeIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;
