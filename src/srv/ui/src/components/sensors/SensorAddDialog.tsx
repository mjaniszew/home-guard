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
import MenuItem from '@mui/material/MenuItem';
import { FormControl } from '@mui/material';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';

import { sensorCreateMutation, SENSOR_TYPES } from '../../api/sensors';

interface CreateHomeDialogProps {
  homeId: string | null;
  open: boolean;
  handleClose: (refresh?: boolean) => void;
};

type SensorData = {
  name: string;
  homeId: string;
  type: string;
};

type ErrorResponse = AxiosError & {
  data: {
    error: string
  }
};

export const SensorAddDialog = ({ open, homeId, handleClose }: CreateHomeDialogProps) => {
  const [ sensorName, setSensorName ] = useState<string>('');
  const [ sensorType, setSensorType ] = useState<string>('');
  const [ error, setError ] = useState<string | null>(null);
  const sensorTypes = Object.keys(SENSOR_TYPES);

  const createMutation = useMutation({
    mutationFn: sensorCreateMutation,
    onError: (err: Error & {response: ErrorResponse}) => (
      setError(err.response.data?.error)
    ),
    onSuccess: () => ( close(true) ),
  });

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (homeId) {
      await createMutation.mutateAsync({ 
        name: sensorName,
        type: sensorType,
        homeId: homeId
      });
    }
  };

  const reset = () => {
    setError(null);
    setSensorType('');
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
        Add new Sensor
      </DialogTitle>
      <DialogContent>
      <Box
        component="form"
        noValidate
        autoComplete="off"
      >
        <Stack spacing={2}>
          <DialogContentText>
            Add new sensor to your home. Data pushed to server will be only 
            accepted for sensors assigned to your home, otherwise it will get rejected. 
            Make sure to select proper type.
          </DialogContentText>
          <TextField 
            id="sensorName"
            label="Name"
            variant="outlined"
            onChange={(event) => setSensorName(event.target.value)}
            required
          />
          <FormControl>
            <InputLabel id="sensorType-label">Type</InputLabel>
            <Select
              id="sensorType"
              value={sensorType}
              labelId="sensorType-label"
              label="Type"
              onChange={(event) => setSensorType(event.target.value)}
              required
            >
            {sensorTypes.map((type) => (
              <MenuItem 
                key={type}
                value={type}
              >
                {type}
              </MenuItem>
            ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => close()}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          disabled={!homeId || !sensorName || !sensorType}
        >Create</Button>
      </DialogActions>
    </Dialog>
  );
};