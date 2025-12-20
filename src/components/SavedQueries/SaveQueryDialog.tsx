import React, { memo, useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

interface SaveQueryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, notes: string) => void;
  initialName?: string;
}

const SaveQueryDialog: React.FC<SaveQueryDialogProps> = memo(
  ({ open, onClose, onSave, initialName = '' }) => {
    const [name, setName] = useState(initialName);
    const [notes, setNotes] = useState('');

    useEffect(() => {
      if (open) {
        setName(initialName || `Query ${new Date().toLocaleString()}`);
        setNotes('');
      }
    }, [open, initialName]);

    const handleSave = useCallback(() => {
      if (name.trim()) {
        onSave(name.trim(), notes.trim());
        onClose();
      }
    }, [name, notes, onSave, onClose]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && name.trim()) {
          e.preventDefault();
          handleSave();
        }
      },
      [handleSave, name]
    );

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Save Query</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Query Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a name for this query"
              size="small"
            />
            <TextField
              label="Notes (optional)"
              fullWidth
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or description..."
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!name.trim()}
          >
            Save Query
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

SaveQueryDialog.displayName = 'SaveQueryDialog';

export default SaveQueryDialog;
