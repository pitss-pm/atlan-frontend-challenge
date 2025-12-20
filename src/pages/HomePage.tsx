import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, Stack } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import {
  DraggableLayout,
  QueryTabs,
  QueryTabPanel,
  OutputViewer,
  QueryHistory,
  ThemeToggle,
  ErrorBoundary,
} from '../components';
import { useQueryTabs, useQueryExecution, useKeyboardShortcuts } from '../hooks';
import { saveQuery, createShare, getShareUrl } from '../services';
import type { ThemeMode } from '../theme';

interface HomePageProps {
  themeMode: ThemeMode;
  onToggleTheme: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ themeMode, onToggleTheme }) => {
  const {
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    addTab,
    closeTab,
    updateTabSQL,
    setTabExecuting,
    setTabResult,
    loadSQL,
  } = useQueryTabs();

  const { runQuery, cancelQuery, isExecuting } = useQueryExecution({
    activeTab,
    setTabExecuting,
    setTabResult,
  });

  const runQueryRef = useRef(runQuery);
  useEffect(() => {
    runQueryRef.current = runQuery;
  }, [runQuery]);

  const handleSaveQuery = useCallback(
    (name: string, notes: string) => {
      if (activeTab?.sql) {
        saveQuery(name, activeTab.sql, notes);
      }
    },
    [activeTab]
  );

  const handleShare = useCallback(() => {
    if (activeTab) {
      const share = createShare(activeTab.sql, activeTab.result);
      return getShareUrl(share.id);
    }
    return '';
  }, [activeTab]);

  const handleRunFromHistory = useCallback(
    (sql: string) => {
      loadSQL(sql);
      setTimeout(() => {
        runQueryRef.current();
      }, 100);
    },
    [loadSQL]
  );

  useKeyboardShortcuts({
    onRunQuery: runQuery,
    onSaveQuery: () => {
    },
    onNewTab: addTab,
    onCloseTab: () => activeTab && closeTab(activeTab.id),
  });

  const panels = useMemo(
    () => [
      {
        id: 'editor',
        title: 'SQL Editor',
        children: (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <QueryTabs
              tabs={tabs}
              activeTabId={activeTabId}
              onTabChange={setActiveTabId}
              onAddTab={() => addTab()}
              onCloseTab={closeTab}
            />
            {activeTab && (
              <Box sx={{ flex: 1, p: 1.5, minHeight: 0 }}>
                <QueryTabPanel
                  tab={activeTab}
                  onSQLChange={(sql) => updateTabSQL(activeTab.id, sql)}
                  onRunQuery={runQuery}
                  onCancelQuery={cancelQuery}
                  onSaveQuery={handleSaveQuery}
                  onShare={handleShare}
                />
              </Box>
            )}
          </Box>
        ),
      },
      {
        id: 'history',
        title: 'Query History & Saved',
        children: (
          <QueryHistory onSelectQuery={loadSQL} onRunQuery={handleRunFromHistory} />
        ),
      },
      {
        id: 'output',
        title: 'Query Results',
        children: (
          <ErrorBoundary>
            <OutputViewer
              result={activeTab?.result || null}
              isLoading={isExecuting}
              error={activeTab?.error}
            />
          </ErrorBoundary>
        ),
      },
    ],
    [
      tabs,
      activeTab,
      activeTabId,
      isExecuting,
      setActiveTabId,
      addTab,
      closeTab,
      updateTabSQL,
      runQuery,
      cancelQuery,
      handleSaveQuery,
      handleShare,
      loadSQL,
      handleRunFromHistory,
    ]
  );

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <StorageIcon color="primary" />
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                color: 'text.primary',
              }}
            >
              SQL Runner
            </Typography>
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              ⌘/Ctrl + Enter to run
            </Typography>
            <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
          </Stack>
        </Toolbar>
      </AppBar>

      {}
      <Box sx={{ flex: 1, overflow: 'hidden', p: 1.5, minHeight: 0 }}>
        <DraggableLayout panels={panels} />
      </Box>
    </Box>
  );
};

export default HomePage;
