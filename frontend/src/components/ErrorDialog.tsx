import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface ErrorDialogProps {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ open, title = 'Error', message, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} sx={{ '& .MuiDialog-paper': { borderRadius: 3, backgroundColor: 'background.paper', minWidth: 350 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', color: '#ff6b6b' }}>
        <span style={{ marginRight: 8 }}>⚠️</span>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Dismiss</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
