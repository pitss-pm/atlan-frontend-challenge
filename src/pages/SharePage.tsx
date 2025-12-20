import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  AppBar,
  Toolbar,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ShareIcon from '@mui/icons-material/Share';
import StorageIcon from '@mui/icons-material/Storage';
import { SQLEditor } from '../components/Editor';
import { OutputViewer } from '../components/OutputViewer';
import { ThemeToggle } from '../components/ThemeToggle';
import { getShare } from '../services/shareService';
import type { SharedQuery } from '../types';
import type { ThemeMode } from '../theme';

interface SharePageProps {
  themeMode: ThemeMode;
  onToggleTheme: () => void;
}

const SharePage: React.FC<SharePageProps> = ({ themeMode, onToggleTheme }) => {
  const { id } = useParams<{ id: string }>();
  const [share, setShare] = useState<SharedQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      const sharedQuery = getShare(id);
      if (sharedQuery) {
        setShare(sharedQuery);
      } else {
        setError('This shared query was not found or has expired.');
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">Loading shared query...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !share) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
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
                sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}
              >
                SQL Runner
              </Typography>
            </Stack>
            <Box sx={{ flex: 1 }} />
            <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
            <ShareIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Query Not Found
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              {error || 'This shared query was not found or has expired.'}
            </Alert>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              startIcon={<HomeIcon />}
            >
              Go to Home
            </Button>
          </Paper>
        </Box>
      </Box>
    );
  }

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
              sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}
            >
              SQL Runner
            </Typography>
            <Chip
              label="Shared Query"
              size="small"
              color="secondary"
              variant="outlined"
            />
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <Button component={RouterLink} to="/" size="small" startIcon={<HomeIcon />}>
              Open in Editor
            </Button>
            <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
          </Stack>
        </Toolbar>
      </AppBar>

      {}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Stack spacing={2}>
          {}
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Shared on: {formatDate(share.sharedAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expires: {formatDate(share.expiresAt)}
              </Typography>
              {share.result && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    •
                  </Typography>
                  <Chip
                    label={`${share.result.totalRows.toLocaleString()} rows`}
                    size="small"
                    variant="outlined"
                  />
                </>
              )}
            </Stack>
          </Paper>

          {}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              SQL Query
            </Typography>
            <Box sx={{ height: 200 }}>
              <SQLEditor value={share.sql} onChange={() => {}} readOnly />
            </Box>
          </Paper>

          {}
          {share.result && (
            <Paper sx={{ p: 0 }}>
              <OutputViewer result={share.result} />
            </Paper>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default SharePage;
