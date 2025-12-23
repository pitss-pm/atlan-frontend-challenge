import React, { memo, useCallback, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Stack,
  CircularProgress,
  Typography,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { SQLEditor } from '../Editor';
import type { QueryTab } from '../../types';
import { formatShortcut } from '../../hooks/useKeyboardShortcuts';
import ShareDialog from '../ShareView/ShareDialog';

interface QueryTabPanelProps {
  tab: QueryTab;
  onSQLChange: (sql: string) => void;
  onRunQuery: () => void;
  onCancelQuery: () => void;
  onSaveQuery: (name: string, notes: string) => void;
  onShare: () => string;
  onOpenSaveDialog: () => void;
  onNewTab: () => void;
  onCloseTab: () => void;
}

const QueryTabPanel: React.FC<QueryTabPanelProps> = memo(
  ({
    tab,
    onSQLChange,
    onRunQuery,
    onCancelQuery,
    onSaveQuery,
    onShare,
    onOpenSaveDialog,
    onNewTab,
    onCloseTab,
  }) => {
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    const handleRunClick = useCallback(() => {
      if (tab.isExecuting) {
        onCancelQuery();
      } else {
        onRunQuery();
      }
    }, [tab.isExecuting, onRunQuery, onCancelQuery]);

    const handleShare = useCallback(() => {
      const url = onShare();
      setShareUrl(url);
      setShareDialogOpen(true);
    }, [onShare]);

    const handleCopySQL = useCallback(() => {
      navigator.clipboard.writeText(tab.sql);
    }, [tab.sql]);

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {}
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center' }}>
          <Button
            variant="contained"
            color={tab.isExecuting ? 'error' : 'primary'}
            startIcon={
              tab.isExecuting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <PlayArrowIcon />
              )
            }
            onClick={handleRunClick}
            disabled={!tab.sql.trim()}
            size="small"
          >
            {tab.isExecuting ? 'Cancel' : 'Run Query'}
          </Button>

          <Tooltip title={`Save Query (${formatShortcut('Mod+S')})`}>
            <span>
              <IconButton
                size="small"
                onClick={onOpenSaveDialog}
                disabled={!tab.sql.trim()}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Share Query">
            <span>
              <IconButton size="small" onClick={handleShare} disabled={!tab.sql.trim()}>
                <ShareIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Copy SQL">
            <span>
              <IconButton
                size="small"
                onClick={handleCopySQL}
                disabled={!tab.sql.trim()}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Box sx={{ flex: 1 }} />

          {}
          {tab.executedAt && !tab.isExecuting && (
            <Stack direction="row" spacing={1} alignItems="center">
              {tab.error ? (
                <Chip label="Error" color="error" size="small" variant="outlined" />
              ) : tab.result ? (
                <>
                  <Typography variant="caption" color="text.secondary">
                    {tab.result.totalRows.toLocaleString()} rows
                  </Typography>
                  <Chip
                    label={`${tab.result.executionTime.toFixed(0)}ms`}
                    color="success"
                    size="small"
                    variant="outlined"
                  />
                </>
              ) : null}
            </Stack>
          )}
        </Stack>

        {}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <SQLEditor
            value={tab.sql}
            onChange={onSQLChange}
            onRunQuery={onRunQuery}
            onSaveQuery={onOpenSaveDialog}
            onNewTab={onNewTab}
            onCloseTab={onCloseTab}
          />
        </Box>

        {}
        {tab.error && (
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              bgcolor: 'error.main',
              color: 'error.contrastText',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2">{tab.error}</Typography>
          </Box>
        )}

        {}
        <ShareDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          shareUrl={shareUrl}
        />
      </Box>
    );
  }
);

QueryTabPanel.displayName = 'QueryTabPanel';

export default QueryTabPanel;
