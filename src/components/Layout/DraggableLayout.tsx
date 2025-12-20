import React, { memo, useCallback, useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useLocalStorage } from '../../hooks';

interface PanelConfig {
  id: string;
  title: string;
  children: React.ReactNode;
}

interface DraggableLayoutProps {
  panels: PanelConfig[];
}

interface LayoutState {
  leftPanelId: string;
  leftWidthPercent: number;
  outputHeightPercent: number;
}

const DEFAULT_LAYOUT_STATE: LayoutState = {
  leftPanelId: 'editor',
  leftWidthPercent: 65,
  outputHeightPercent: 40,
};

const MIN_PANEL_WIDTH_PERCENT = 25;
const MAX_PANEL_WIDTH_PERCENT = 75;
const MIN_OUTPUT_HEIGHT_PERCENT = 20;
const MAX_OUTPUT_HEIGHT_PERCENT = 60;

const DraggableLayout: React.FC<DraggableLayoutProps> = memo(({ panels }) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutState, setLayoutState] = useLocalStorage<LayoutState>(
    'sql_runner_layout_v3',
    DEFAULT_LAYOUT_STATE
  );
  const [isHorizontalResizing, setIsHorizontalResizing] = useState(false);
  const [isVerticalResizing, setIsVerticalResizing] = useState(false);
  const [dragOverLeft, setDragOverLeft] = useState(false);
  const [dragOverRight, setDragOverRight] = useState(false);

  const editorPanel = panels.find((p) => p.id === 'editor');
  const historyPanel = panels.find((p) => p.id === 'history');
  const outputPanel = panels.find((p) => p.id === 'output');

  const leftPanel = layoutState.leftPanelId === 'editor' ? editorPanel : historyPanel;
  const rightPanel = layoutState.leftPanelId === 'editor' ? historyPanel : editorPanel;

  const topHeightPercent = 100 - layoutState.outputHeightPercent;

  const handleHorizontalResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsHorizontalResizing(true);

      const startX = e.clientX;
      const startWidth = layoutState.leftWidthPercent;
      const containerWidth = containerRef.current?.offsetWidth || 1200;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaPercent = (deltaX / containerWidth) * 100;
        const newWidth = Math.min(
          MAX_PANEL_WIDTH_PERCENT,
          Math.max(MIN_PANEL_WIDTH_PERCENT, startWidth + deltaPercent)
        );
        setLayoutState((prev) => ({ ...prev, leftWidthPercent: newWidth }));
      };

      const handleMouseUp = () => {
        setIsHorizontalResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [layoutState.leftWidthPercent, setLayoutState]
  );

  const handleVerticalResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsVerticalResizing(true);

      const startY = e.clientY;
      const startHeight = layoutState.outputHeightPercent;
      const containerHeight = containerRef.current?.offsetHeight || 800;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaY = startY - moveEvent.clientY; // Invert because dragging up increases height
        const deltaPercent = (deltaY / containerHeight) * 100;
        const newHeight = Math.min(
          MAX_OUTPUT_HEIGHT_PERCENT,
          Math.max(MIN_OUTPUT_HEIGHT_PERCENT, startHeight + deltaPercent)
        );
        setLayoutState((prev) => ({ ...prev, outputHeightPercent: newHeight }));
      };

      const handleMouseUp = () => {
        setIsVerticalResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [layoutState.outputHeightPercent, setLayoutState]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, panelId: string) => {
      e.dataTransfer.setData('panelId', panelId);
      e.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDropOnLeft = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('panelId');
      if (draggedId && draggedId !== layoutState.leftPanelId) {
        setLayoutState((prev) => ({
          ...prev,
          leftPanelId: draggedId,
        }));
      }
      setDragOverLeft(false);
    },
    [layoutState.leftPanelId, setLayoutState]
  );

  const handleDropOnRight = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('panelId');
      if (draggedId && draggedId === layoutState.leftPanelId) {
        const otherId = layoutState.leftPanelId === 'editor' ? 'history' : 'editor';
        setLayoutState((prev) => ({
          ...prev,
          leftPanelId: otherId,
        }));
      }
      setDragOverRight(false);
    },
    [layoutState.leftPanelId, setLayoutState]
  );

  useEffect(() => {
    const isResizing = isHorizontalResizing || isVerticalResizing;
    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = isVerticalResizing ? 'row-resize' : 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isHorizontalResizing, isVerticalResizing]);

  const renderPanel = (
    panel: PanelConfig | undefined,
    isDraggable: boolean,
    position: 'left' | 'right' | 'bottom'
  ) => {
    if (!panel) return null;

    const isDragOver = position === 'left' ? dragOverLeft : position === 'right' ? dragOverRight : false;

    return (
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: 1,
          borderColor: isDragOver ? 'primary.main' : 'divider',
          borderWidth: isDragOver ? 2 : 1,
          transition: 'border-color 0.15s ease',
        }}
        onDragOver={isDraggable ? handleDragOver : undefined}
        onDragEnter={
          isDraggable
            ? () => (position === 'left' ? setDragOverLeft(true) : setDragOverRight(true))
            : undefined
        }
        onDragLeave={
          isDraggable
            ? () => (position === 'left' ? setDragOverLeft(false) : setDragOverRight(false))
            : undefined
        }
        onDrop={
          isDraggable
            ? position === 'left'
              ? handleDropOnLeft
              : handleDropOnRight
            : undefined
        }
      >
        {}
        <Box
          draggable={isDraggable}
          onDragStart={isDraggable ? (e) => handleDragStart(e, panel.id) : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 1.5,
            py: 1,
            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
            borderBottom: 1,
            borderColor: 'divider',
            cursor: isDraggable ? 'grab' : 'default',
            '&:active': {
              cursor: isDraggable ? 'grabbing' : 'default',
            },
            userSelect: 'none',
          }}
        >
          {isDraggable && (
            <DragIndicatorIcon
              fontSize="small"
              sx={{ color: 'text.disabled', mr: 1 }}
            />
          )}
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
          >
            {panel.title}
          </Typography>
        </Box>

        {}
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {panel.children}
        </Box>
      </Paper>
    );
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {}
      <Box
        sx={{
          height: `${topHeightPercent}%`,
          display: 'flex',
          gap: 0,
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {}
        <Box
          sx={{
            width: `${layoutState.leftWidthPercent}%`,
            height: '100%',
            flexShrink: 0,
          }}
        >
          {renderPanel(leftPanel, true, 'left')}
        </Box>

        {}
        <Box
          onMouseDown={handleHorizontalResizeStart}
          sx={{
            width: 12,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'col-resize',
            flexShrink: 0,
            zIndex: 10,
            '&:hover': {
              '& .resize-indicator-h': {
                bgcolor: 'primary.main',
              },
            },
          }}
        >
          <Box
            className="resize-indicator-h"
            sx={{
              width: 4,
              height: 40,
              borderRadius: 2,
              bgcolor: isHorizontalResizing ? 'primary.main' : 'divider',
              transition: 'background-color 0.15s ease',
            }}
          />
        </Box>

        {}
        <Box
          sx={{
            flex: 1,
            height: '100%',
            minWidth: 0,
          }}
        >
          {renderPanel(rightPanel, true, 'right')}
        </Box>
      </Box>

      {}
      <Box
        onMouseDown={handleVerticalResizeStart}
        sx={{
          height: 12,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'row-resize',
          flexShrink: 0,
          zIndex: 10,
          '&:hover': {
            '& .resize-indicator-v': {
              bgcolor: 'primary.main',
            },
          },
        }}
      >
        <Box
          className="resize-indicator-v"
          sx={{
            width: 40,
            height: 4,
            borderRadius: 2,
            bgcolor: isVerticalResizing ? 'primary.main' : 'divider',
            transition: 'background-color 0.15s ease',
          }}
        />
      </Box>

      {}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
        }}
      >
        {renderPanel(outputPanel, false, 'bottom')}
      </Box>
    </Box>
  );
});

DraggableLayout.displayName = 'DraggableLayout';

export default DraggableLayout;
