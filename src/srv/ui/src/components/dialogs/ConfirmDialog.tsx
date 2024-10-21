import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

interface ConfirmDialogProps {
  warningText?: string;
  open: boolean;
  handleClose: (confirm?: boolean) => void;
};

export const ConfirmDialog = ({ open, warningText, handleClose}: ConfirmDialogProps) => {
  return (
    <Dialog fullWidth open={open} onClose={() => handleClose()}>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent>
        {warningText}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()}>Cancel</Button>
        <Button 
          onClick={() => handleClose(true)}
        >Confirm</Button>
      </DialogActions>
    </Dialog>
  );
} 