import React, { memo, useCallback, useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Skeleton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import VirtualizedTable from './VirtualizedTable';
import type { QueryResult, ColumnDefinition } from '../../types';
import { downloadCSV, estimateCSVSize, formatBytes } from '../../utils/csvExport';

interface OutputViewerProps {
  result: QueryResult | null;
  isLoading?: boolean;
  error?: string | null;
}

const LOAD_COUNT_OPTIONS = [100, 200, 500, 1000, 2000];
const DEFAULT_LOAD_COUNT = 100;

const OutputViewer: React.FC<OutputViewerProps> = memo(
  ({ result, isLoading = false, error }) => {
    const [columns, setColumns] = useState<ColumnDefinition[]>([]);
    const [displayedCount, setDisplayedCount] = useState(DEFAULT_LOAD_COUNT);
    const [loadCount, setLoadCount] = useState(DEFAULT_LOAD_COUNT);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const prevResultRef = useRef<QueryResult | null>(null);
    const loadingMoreRef = useRef(false);

    useEffect(() => {
      if (result && result !== prevResultRef.current) {
        setColumns(result.columns);
        setDisplayedCount(Math.min(loadCount, result.rows.length));
        prevResultRef.current = result;
      } else if (!result) {
        setColumns([]);
        setDisplayedCount(0);
        prevResultRef.current = null;
      }
    }, [result, loadCount]);

    const displayedRows = useMemo(() => {
      if (!result) return [];
      return result.rows.slice(0, displayedCount);
    }, [result, displayedCount]);

    const hasMoreRows = result ? displayedCount < result.totalRows : false;

    const handleLoadMore = useCallback(() => {
      if (!result || loadingMoreRef.current || !hasMoreRows) return;

      loadingMoreRef.current = true;
      setIsLoadingMore(true);

      setTimeout(() => {
        setDisplayedCount((prev) => Math.min(prev + loadCount, result.rows.length));
        setIsLoadingMore(false);
        loadingMoreRef.current = false;
      }, 150);
    }, [result, loadCount, hasMoreRows]);

    const handleLoadCountChange = useCallback((newCount: number) => {
      setLoadCount(newCount);
    }, []);

    const handleDownload = useCallback(() => {
      if (!result) return;
      downloadCSV(columns, result.rows, {
        filename: `query_results`,
        visibleColumnsOnly: true,
      });
    }, [result, columns]);

    const handleColumnVisibilityChange = useCallback(
      (updatedColumns: ColumnDefinition[]) => {
        setColumns(updatedColumns);
      },
      []
    );

    if (isLoading) {
      return (
        <Paper
          elevation={0}
          sx={{
            height: '100%',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" width={100} height={32} />
            <Skeleton variant="text" width={150} />
          </Stack>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rectangular" height="100%" />
          </Box>
        </Paper>
      );
    }

    if (error) {
      return (
        <Paper
          elevation={0}
          sx={{
            height: '100%',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography color="error" variant="h6" gutterBottom>
            Query Error
          </Typography>
          <Typography color="text.secondary">{error}</Typography>
        </Paper>
      );
    }

    if (!result) {
      return (
        <Paper
          elevation={0}
          sx={{
            height: '100%',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TableChartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary" variant="h6">
            No Results Yet
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Run a query to see results here
          </Typography>
        </Paper>
      );
    }

    const estimatedSize = estimateCSVSize(columns, result.rows);
    const loadProgress = (displayedCount / result.totalRows) * 100;

    return (
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
          sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Results
          </Typography>

          {}
          <Chip
            label={
              hasMoreRows
                ? `${displayedCount.toLocaleString()} of ${result.totalRows.toLocaleString()} rows`
                : `${result.totalRows.toLocaleString()} rows`
            }
            size="small"
            color={hasMoreRows ? 'warning' : 'success'}
            variant="outlined"
          />

          <Chip
            label={`${result.executionTime.toFixed(0)}ms`}
            size="small"
            color="success"
            variant="outlined"
          />

          {}
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel id="load-count-label" sx={{ fontSize: '0.75rem' }}>
              Batch size
            </InputLabel>
            <Select
              labelId="load-count-label"
              value={loadCount}
              label="Batch size"
              onChange={(e) => handleLoadCountChange(e.target.value as number)}
              sx={{ fontSize: '0.75rem', height: 28 }}
            >
              {LOAD_COUNT_OPTIONS.map((count) => (
                <MenuItem key={count} value={count} sx={{ fontSize: '0.75rem' }}>
                  {count}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {}
          {isLoadingMore && (
            <Typography
              variant="caption"
              color="primary"
              sx={{
                fontStyle: 'italic',
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            >
              ⏳ Loading more...
            </Typography>
          )}

          <Box sx={{ flex: 1 }} />

          <Typography variant="caption" color="text.secondary">
            ~{formatBytes(estimatedSize)}
          </Typography>

          <Button
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          >
            Download All
          </Button>
        </Stack>

        {}
        {hasMoreRows && (
          <Box sx={{ px: 1.5, pt: 0.5 }}>
            <LinearProgress
              variant={isLoadingMore ? 'buffer' : 'determinate'}
              value={loadProgress}
              valueBuffer={isLoadingMore ? Math.min(loadProgress + 10, 100) : loadProgress}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  transition: isLoadingMore ? 'none' : 'transform 0.3s ease',
                },
                '& .MuiLinearProgress-dashed': {
                  animation: 'dash 1s ease-in-out infinite',
                },
                '@keyframes dash': {
                  '0%': { backgroundPosition: '0 0' },
                  '100%': { backgroundPosition: '40px 0' },
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mt: 0.25, fontSize: '0.7rem' }}
            >
              {isLoadingMore
                ? `Loading... ${displayedCount.toLocaleString()} rows`
                : `${loadProgress.toFixed(0)}% loaded`}
            </Typography>
          </Box>
        )}

        {}
        <Box sx={{ flex: 1, p: 1.5, minHeight: 0 }}>
          <VirtualizedTable
            columns={columns}
            rows={displayedRows}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            onLoadMore={hasMoreRows ? handleLoadMore : undefined}
            isLoadingMore={isLoadingMore}
          />
        </Box>
      </Paper>
    );
  }
);

OutputViewer.displayName = 'OutputViewer';

export default OutputViewer;
