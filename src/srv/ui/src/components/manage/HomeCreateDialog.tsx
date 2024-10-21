import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';

import { homeCreateMutation } from '../../api/home';

interface CreateHomeDialogProps {
  open: boolean;
  handleClose: (refresh?: boolean) => void;
};

type ErrorResponse = AxiosError & {
  data: {
    error: string
  }
};

export const HomeCreateDialog = ({ open, handleClose }: CreateHomeDialogProps) => {
  const [ homeName, setHomeName ] = useState('');
  const [ error, setError ] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: homeCreateMutation,
    onError: (err: Error & {response: ErrorResponse}) => (
      setError(err.response.data?.error)
    ),
    onSuccess: () => ( close(true) ),
  });

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    await createMutation.mutateAsync({ name: homeName });
  };

  const reset = () => {
    setError(null);
    setHomeName('');
  }

  const close = (refresh?: boolean) => {
    reset();
    handleClose(refresh);
  }
  
  return (
    <Dialog
      open={open}
      onClose={() => close()}
    >
      <DialogTitle id="home-dialog-title">
        Create new Home
      </DialogTitle>
      <DialogContent>
      <Box>
        <Stack spacing={2}>
          <DialogContentText>
            Create new Home and assign access tokens in order to add and manage your devices.
          </DialogContentText>
          <FormControl>
            <TextField 
              id="homeName"
              label="Name"
              variant="outlined"
              onChange={(event) => setHomeName(event.target.value)}
              error={!!error}
              required
            />
          </FormControl>
        </Stack>
      </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          disabled={!homeName}
        >Create</Button>
      </DialogActions>
    </Dialog>
  );
};