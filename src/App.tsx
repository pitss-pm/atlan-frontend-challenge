import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { HomePage, SharePage } from './pages';
import { ErrorBoundary } from './components';
import { useThemeMode } from './hooks';

const App: React.FC = () => {
  const { mode, theme, toggleTheme } = useThemeMode();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={<HomePage themeMode={mode} onToggleTheme={toggleTheme} />}
            />
            <Route
              path="/share/:id"
              element={<SharePage themeMode={mode} onToggleTheme={toggleTheme} />}
            />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
