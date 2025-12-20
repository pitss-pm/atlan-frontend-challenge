import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
  CSSProperties,
} from 'react';
import { List } from 'react-window';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  Tooltip,
  useTheme,
  CircularProgress,
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { ColumnDefinition } from '../../types';

interface VirtualizedTableProps {
  columns: ColumnDefinition[];
  rows: Record<string, unknown>[];
  onColumnVisibilityChange?: (columns: ColumnDefinition[]) => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 42;
const MIN_LIST_HEIGHT = 100;
const LOAD_MORE_THRESHOLD = 10;

interface ColumnHeaderProps {
  column: ColumnDefinition;
  onResize: (key: string, width: number) => void;
  isLast: boolean;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = memo(
  ({ column, onResize, isLast }) => {
    const theme = useTheme();
    const resizeRef = useRef<number | null>(null);
    const startXRef = useRef<number>(0);
    const startWidthRef = useRef<number>(0);

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        startXRef.current = e.clientX;
        startWidthRef.current = column.width;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const diff = moveEvent.clientX - startXRef.current;
          const newWidth = Math.max(50, startWidthRef.current + diff);
          if (resizeRef.current) {
            cancelAnimationFrame(resizeRef.current);
          }
          resizeRef.current = requestAnimationFrame(() => {
            onResize(column.key, newWidth);
          });
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      },
      [column.key, column.width, onResize]
    );

    if (!column.visible) return null;

    return (
      <Box
        sx={{
          width: column.width,
          minWidth: column.width,
          maxWidth: column.width,
          px: 1.5,
          py: 1,
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: 'text.primary',
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
          borderRight: isLast ? 0 : 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          userSelect: 'none',
        }}
      >
        <Typography variant="body2" noWrap sx={{ fontWeight: 600, flex: 1 }}>
          {column.label}
        </Typography>
        {!isLast && (
          <Box
            onMouseDown={handleMouseDown}
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 6,
              cursor: 'col-resize',
              '&:hover': {
                bgcolor: 'primary.main',
              },
            }}
          />
        )}
      </Box>
    );
  }
);

ColumnHeader.displayName = 'ColumnHeader';

function formatCellValue(value: unknown, type: ColumnDefinition['type']): string {
  if (value === null || value === undefined) {
    return '—';
  }

  switch (type) {
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value);
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'date':
      if (typeof value === 'string' && value.includes('T')) {
        return new Date(value).toLocaleString();
      }
      return String(value);
    default:
      return String(value);
  }
}

interface VirtualizedRowProps {
  rows: Record<string, unknown>[];
  visibleColumns: ColumnDefinition[];
  isDark: boolean;
}

function VirtualizedRow({
  index,
  style,
  rows,
  visibleColumns,
  isDark,
}: {
  ariaAttributes: {
    'aria-posinset': number;
    'aria-setsize': number;
    role: 'listitem';
  };
  index: number;
  style: CSSProperties;
} & VirtualizedRowProps): React.ReactElement {
  const row = rows[index];
  const isEven = index % 2 === 0;

  if (!row) {
    return <div style={style} />;
  }

  return (
    <Box
      style={style}
      sx={{
        display: 'flex',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: isEven
          ? 'transparent'
          : isDark
            ? 'rgba(255,255,255,0.02)'
            : 'rgba(0,0,0,0.02)',
        '&:hover': {
          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        },
      }}
    >
      {visibleColumns.map((column) => (
        <Box
          key={column.key}
          sx={{
            width: column.width,
            minWidth: column.width,
            maxWidth: column.width,
            px: 1.5,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            borderRight: 1,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Typography variant="body2" noWrap sx={{ fontSize: '0.8125rem' }}>
            {formatCellValue(row[column.key], column.type)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

const VirtualizedTable: React.FC<VirtualizedTableProps> = memo(
  ({ columns: propColumns, rows, onColumnVisibilityChange, onLoadMore, isLoadingMore = false }) => {
    const theme = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const [columns, setColumns] = useState<ColumnDefinition[]>(propColumns);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [containerHeight, setContainerHeight] = useState(300);

    useEffect(() => {
      setColumns(propColumns);
    }, [propColumns]);

    useEffect(() => {
      const updateHeight = () => {
        if (containerRef.current) {
          const height = containerRef.current.offsetHeight;
          if (height > 0) {
            setContainerHeight(height);
          }
        }
      };

      updateHeight();

      const resizeObserver = new ResizeObserver(updateHeight);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => resizeObserver.disconnect();
    }, []);

    const visibleColumns = useMemo(
      () => columns.filter((c) => c.visible),
      [columns]
    );

    const totalWidth = useMemo(
      () => visibleColumns.reduce((sum, col) => sum + col.width, 0),
      [visibleColumns]
    );

    const handleColumnResize = useCallback((key: string, width: number) => {
      setColumns((prev) =>
        prev.map((col) => (col.key === key ? { ...col, width } : col))
      );
    }, []);

    const handleVisibilityChange = useCallback(
      (key: string) => {
        setColumns((prev) => {
          const updated = prev.map((col) =>
            col.key === key ? { ...col, visible: !col.visible } : col
          );
          onColumnVisibilityChange?.(updated);
          return updated;
        });
      },
      [onColumnVisibilityChange]
    );

    const handleRowsRendered = useCallback(
      (
        visibleRows: { startIndex: number; stopIndex: number },
        _allRows: { startIndex: number; stopIndex: number }
      ) => {
        if (!onLoadMore || isLoadingMore) return;

        const remainingRows = rows.length - visibleRows.stopIndex;
        if (remainingRows <= LOAD_MORE_THRESHOLD) {
          onLoadMore();
        }
      },
      [onLoadMore, isLoadingMore, rows.length]
    );

    const rowProps = useMemo<VirtualizedRowProps>(
      () => ({
        rows,
        visibleColumns,
        isDark: theme.palette.mode === 'dark',
      }),
      [rows, visibleColumns, theme.palette.mode]
    );

    if (!rows || rows.length === 0) {
      return (
        <Box
          ref={containerRef}
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography>No results to display</Typography>
        </Box>
      );
    }

    const listHeight = Math.max(MIN_LIST_HEIGHT, containerHeight - HEADER_HEIGHT - 40);

    return (
      <Box ref={containerRef} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <Tooltip title="Show/Hide Columns">
            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <ViewColumnIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            {columns.map((column) => (
              <MenuItem key={column.key} onClick={() => handleVisibilityChange(column.key)} dense>
                <Checkbox checked={column.visible} size="small" />
                <ListItemText primary={column.label} />
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {}
        <Box
          sx={{
            flex: 1,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {}
          <Box
            sx={{
              display: 'flex',
              position: 'sticky',
              top: 0,
              zIndex: 1,
              minWidth: totalWidth,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
            }}
          >
            {visibleColumns.map((column, idx) => (
              <ColumnHeader
                key={column.key}
                column={column}
                onResize={handleColumnResize}
                isLast={idx === visibleColumns.length - 1}
              />
            ))}
          </Box>

          {}
          <Box sx={{ overflowX: 'auto', height: listHeight }}>
            <Box sx={{ minWidth: totalWidth }}>
              <List
                rowComponent={VirtualizedRow}
                rowCount={rows.length}
                rowHeight={ROW_HEIGHT}
                rowProps={rowProps}
                overscanCount={10}
                onRowsRendered={handleRowsRendered}
                style={{ height: listHeight }}
              />
            </Box>
          </Box>

          {}
          {isLoadingMore && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 1,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Loading more rows...
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);

VirtualizedTable.displayName = 'VirtualizedTable';

export default VirtualizedTable;
