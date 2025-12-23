import React, { memo, useCallback, useState, useMemo } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Chip,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import type { QueryHistoryItem, SavedQuery } from '../../types';
import {
  deleteSavedQuery,
  clearQueryHistory,
  STORAGE_KEYS,
} from '../../services';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface QueryHistoryProps {
  onSelectQuery: (sql: string) => void;
  onRunQuery: (sql: string) => void;
}

const QueryHistory: React.FC<QueryHistoryProps> = memo(
  ({ onSelectQuery, onRunQuery }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const [history] = useLocalStorage<QueryHistoryItem[]>(
      STORAGE_KEYS.QUERY_HISTORY,
      []
    );
    const [savedQueries] = useLocalStorage<SavedQuery[]>(
      STORAGE_KEYS.SAVED_QUERIES,
      []
    );

    const filteredHistory = useMemo(() => {
      if (!searchTerm) return history;
      const lower = searchTerm.toLowerCase();
      return history.filter((item) => item.sql.toLowerCase().includes(lower));
    }, [history, searchTerm]);

    const filteredSaved = useMemo(() => {
      if (!searchTerm) return savedQueries;
      const lower = searchTerm.toLowerCase();
      return savedQueries.filter(
        (item) =>
          item.sql.toLowerCase().includes(lower) ||
          item.name.toLowerCase().includes(lower)
      );
    }, [savedQueries, searchTerm]);

    const handleCopy = useCallback((sql: string) => {
      navigator.clipboard.writeText(sql);
    }, []);

    const handleDeleteSaved = useCallback((id: string) => {
      deleteSavedQuery(id);
    }, []);

    const handleClearHistory = useCallback(() => {
      clearQueryHistory();
    }, []);

    const formatTime = useCallback((timestamp: number) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return date.toLocaleDateString();
    }, []);

    const truncateSQL = useCallback((sql: string, maxLength = 100) => {
      const singleLine = sql.replace(/\s+/g, ' ').trim();
      if (singleLine.length <= maxLength) return singleLine;
      return singleLine.substring(0, maxLength) + '...';
    }, []);

    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRadius: 1,
        }}
      >
        {}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<HistoryIcon fontSize="small" />}
            iconPosition="start"
            label="History"
            sx={{ minHeight: 42, fontSize: '0.8125rem' }}
          />
          <Tab
            icon={<BookmarkIcon fontSize="small" />}
            iconPosition="start"
            label="Saved"
            sx={{ minHeight: 42, fontSize: '0.8125rem' }}
          />
        </Tabs>

        {}
        <Box sx={{ p: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 0 ? (
            filteredHistory.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary" variant="body2">
                  No query history yet
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ px: 1.5, pb: 1 }}>
                  <Tooltip title="Clear all history">
                    <Chip
                      label="Clear History"
                      size="small"
                      onClick={handleClearHistory}
                      onDelete={handleClearHistory}
                      deleteIcon={<DeleteIcon fontSize="small" />}
                    />
                  </Tooltip>
                </Box>
                <List dense disablePadding>
                  {filteredHistory.map((item) => (
                    <ListItem
                      key={item.id}
                      disablePadding
                      secondaryAction={
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Run Query">
                            <IconButton
                              size="small"
                              onClick={() => onRunQuery(item.sql)}
                            >
                              <PlayArrowIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Copy SQL">
                            <IconButton
                              size="small"
                              onClick={() => handleCopy(item.sql)}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      }
                    >
                      <ListItemButton
                        onClick={() => onSelectQuery(item.sql)}
                        sx={{ pr: 10 }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                              }}
                            >
                              {truncateSQL(item.sql)}
                            </Typography>
                          }
                          secondary={
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(item.executedAt)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.rowCount} rows
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </>
            )
          ) : // Saved tab
          filteredSaved.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body2">
                No saved queries yet
              </Typography>
              <Typography color="text.secondary" variant="caption">
                Use the save button to bookmark queries
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {filteredSaved.map((item) => (
                <ListItem
                  key={item.id}
                  disablePadding
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Run Query">
                        <IconButton size="small" onClick={() => onRunQuery(item.sql)}>
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSaved(item.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <ListItemButton
                    onClick={() => onSelectQuery(item.sql)}
                    sx={{ pr: 10 }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={500}>
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.7rem',
                              display: 'block',
                            }}
                          >
                            {truncateSQL(item.sql, 60)}
                          </Typography>
                          {item.notes && (
                            <Typography variant="caption" color="text.secondary">
                              {item.notes}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    );
  }
);

QueryHistory.displayName = 'QueryHistory';

export default QueryHistory;
