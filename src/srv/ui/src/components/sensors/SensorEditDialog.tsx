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

import { 
  sensorEditMutation,
  HomeSensorResponse,
  SENSOR_TYPES
} from '../../api/sensors';

interface CreateHomeDialogProps {
  open: boolean;
  sensorData: HomeSensorResponse;
  handleClose: (refresh?: boolean) => void;
};

type ErrorResponse = AxiosError & {
  data: {
    error: string
  }
};

export const SensorEditDialog = ({ open, sensorData, handleClose }: CreateHomeDialogProps) => {
  const [ sensorName, setSensorName ] = useState<string>('');
  const [ sensorType, setSensorType ] = useState<string>('');
  const [ error, setError ] = useState<string | null>(null);
  const sensorTypes = Object.keys(SENSOR_TYPES);

  const editMutation = useMutation({
    mutationFn: sensorEditMutation,
    onError: (err: Error & {response: ErrorResponse}) => (
      setError(err.response.data?.error)
    ),
    onSuccess: () => ( close(true) ),
  });

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (sensorData.homeId) {
      await editMutation.mutateAsync({ 
        name: sensorName,
        type: sensorType,
        sensorId: sensorData._id
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
        Edit sensor: {sensorData.name}
      </DialogTitle>
      <DialogContent>
      <Box
        component="form"
        noValidate
        autoComplete="off"
      >
        <Stack spacing={2}>
          <DialogContentText>
            Edit your sensor details. Fields left empty will not be edited on saving
          </DialogContentText>
          <TextField 
            id="sensorName"
            label="Name"
            variant="outlined"
            onChange={(event) => setSensorName(event.target.value)}
            error={Boolean(error)}
          />
          <FormControl>
            <InputLabel id="sensorType-label">Type</InputLabel>
            <Select
              id="sensorType"
              value={sensorType}
              labelId="sensorType-label"
              label="Type"
              onChange={(event) => setSensorType(event.target.value)}
              error={Boolean(error)}
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
          disabled={!sensorName && !sensorType}
        >Save</Button>
      </DialogActions>
    </Dialog>
  );
};