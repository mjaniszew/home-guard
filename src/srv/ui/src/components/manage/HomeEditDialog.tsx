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

import { 
  homeEditMutation,
  UserHomeDataResponse
} from '../../api/home';

export type EditHomeDetailsType = Omit<UserHomeDataResponse, 'tokens' | 'userId'>;

interface EditHomeDialogProps {
  open: boolean;
  homeDetails: EditHomeDetailsType;
  handleClose: (refresh?: boolean) => void;
};

type ErrorResponse = AxiosError & {
  data: {
    error: string
  }
};

export const HomeEditDialog = ({ open, handleClose, homeDetails }: EditHomeDialogProps) => {
  const [ homeName, setHomeName ] = useState(homeDetails.name);
  const [ notificationTopic, setNotificationTopic ] = useState('');
  const [ error, setError ] = useState<string | null>(null);

  const editMutation = useMutation({
    mutationFn: homeEditMutation,
    onError: (err: Error & {response: ErrorResponse}) => (
      setError(err.response.data?.error)
    ),
    onSuccess: () => ( close(true) ),
  });

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    await editMutation.mutateAsync({ 
      homeId: homeDetails._id,
      name: homeName,
      notificationTopic
    });
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
        Edit your home: {homeDetails.name}
      </DialogTitle>
      <DialogContent>
      <Box>
        <Stack spacing={2}>
          <DialogContentText>
            Edit your home details. Fields left empty will not be edited on saving
          </DialogContentText>
          <FormControl>
            <TextField 
              id="homeName"
              label="Name"
              variant="outlined"
              onChange={(event) => setHomeName(event.target.value)}
              error={!!error}
            />
            <TextField 
              id="homeNotifyTopic"
              label="Notification Topic Name"
              variant="outlined"
              onChange={(event) => setNotificationTopic(event.target.value)}
              error={!!error}
            />
          </FormControl>
        </Stack>
      </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
        >Save</Button>
      </DialogActions>
    </Dialog>
  );
};