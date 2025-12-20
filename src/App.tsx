import React from 'react';
import { ThemeProvider, CssBaseline, Box, Typography } from '@mui/material';
import { lightTheme } from './theme';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          SQL Runner
        </Typography>
        <Typography color="text.secondary">
          A lightweight SQL workspace for data analysts
        </Typography>
      </Box>
    </ThemeProvider>
  );
};

export default App;
