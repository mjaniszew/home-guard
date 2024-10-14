import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import cryptoRandomString from 'crypto-random-string';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { tokenCreateMutation } from '../../api/home';

interface CreateTokenDialogProps {
  open: boolean;
  homeId: string;
  homeName: string;
  handleClose: (refresh?: boolean) => void;
};

type ErrorResponse = AxiosError & {
  data: {
    error: string
  }
};

export const HomeTokenCreateDialog = ({ open, homeId, homeName, handleClose }: CreateTokenDialogProps) => {
  const [ tokenName, setTokenName ] = useState('');
  const [ tokenValue, setTokenValue ] = useState('');
  const [ error, setError ] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: tokenCreateMutation,
    onError: (err: Error & {response: ErrorResponse}) => (
      setError(err.response.data?.error)
    ),
    onSuccess: () => ( close(true) ),
  });

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    await createMutation.mutateAsync({ name: tokenName, value: tokenValue, homeId });
  };

  const reset = () => {
    setError(null);
    setTokenName('');
    setTokenValue('');
  }

  const close = (refresh?: boolean) => {
    reset();
    handleClose(refresh);
  }

  const generateToken = () => {
    setTokenValue(cryptoRandomString({length: 32, type: 'alphanumeric'}))
  }
  
  return (
    <Dialog
      open={open}
      onClose={() => close()}
    >
      <DialogTitle id="token-dialog-title">
        Create new Auth Token for: {homeName}
      </DialogTitle>
      <DialogContent>
      <Box
        component="form"
        noValidate
        autoComplete="off"
      >
        <DialogContentText>
          Provided token value can be used in your devices later on in order to send data for your home
        </DialogContentText>
        <Stack spacing={2}>
          <TextField 
            id="tokenName"
            label="Name"
            variant="standard"
            onChange={(event) => setTokenName(event.target.value)}
            error={!!error}
            required
          />
          <TextField
            id="tokenValue"
            label="Value"
            variant="standard"
            onChange={(event) => setTokenValue(event.target.value)}
            value={tokenValue}
            helperText={error}
            error={!!error}
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">

                    <Tooltip title="Generate random token">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={generateToken}
                      >
                        <AutorenewIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          disabled={!tokenName || !tokenValue}
        >Create</Button>
      </DialogActions>
    </Dialog>
  );
};