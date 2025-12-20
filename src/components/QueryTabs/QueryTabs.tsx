import React, { memo, useCallback } from 'react';
import { Box, Tab, Tabs, IconButton, Tooltip, styled } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import type { QueryTab } from '../../types';

interface QueryTabsProps {
  tabs: QueryTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onAddTab: () => void;
  onCloseTab: (tabId: string) => void;
}

const StyledTab = styled(Tab)(() => ({
  minHeight: 36,
  padding: '6px 8px 6px 16px',
  '&:hover .close-button': {
    opacity: 1,
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  marginLeft: 4,
  padding: 2,
  opacity: 0.5,
  transition: 'opacity 0.2s',
  '&:hover': {
    opacity: 1,
    backgroundColor: theme.palette.action.hover,
  },
}));

const QueryTabs: React.FC<QueryTabsProps> = memo(
  ({ tabs, activeTabId, onTabChange, onAddTab, onCloseTab }) => {
    const handleTabChange = useCallback(
      (_event: React.SyntheticEvent, newValue: string) => {
        onTabChange(newValue);
      },
      [onTabChange]
    );

    const handleCloseClick = useCallback(
      (e: React.MouseEvent, tabId: string) => {
        e.stopPropagation();
        onCloseTab(tabId);
      },
      [onCloseTab]
    );

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={activeTabId}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            flex: 1,
            minHeight: 36,
            '& .MuiTabs-indicator': {
              height: 3,
            },
          }}
        >
          {tabs.map((tab) => (
            <StyledTab
              key={tab.id}
              value={tab.id}
              label={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <span>{tab.name}</span>
                  {tab.isExecuting && (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'warning.main',
                        animation: 'pulse 1s infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.4 },
                        },
                      }}
                    />
                  )}
                  <CloseButton
                    className="close-button"
                    size="small"
                    onClick={(e) => handleCloseClick(e, tab.id)}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </CloseButton>
                </Box>
              }
            />
          ))}
        </Tabs>

        <Tooltip title="New Query Tab (Cmd/Ctrl + T)">
          <IconButton size="small" onClick={onAddTab} sx={{ mx: 1 }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }
);

QueryTabs.displayName = 'QueryTabs';

export default QueryTabs;
