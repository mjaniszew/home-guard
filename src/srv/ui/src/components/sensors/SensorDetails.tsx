import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

import { ConfirmDialog } from '../dialogs/ConfirmDialog.js';
import { HomeSensorResponse, sensorDeleteMutation } from '../../api/sensors';

interface UserDetailsProps {
  sensorData: HomeSensorResponse;
}

export const SensorDetails = ({ sensorData }: UserDetailsProps) => {
  const navigate = useNavigate();
  const [ deleteSensorDialogOpen, setDeleteSensorDialogOpen ] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: sensorDeleteMutation,
    onSuccess: () => {
      navigate('/');
    }
  });

  const handleDeleteSensor = () => {
    setDeleteSensorDialogOpen(true);
  };

  const handleDeleteSensorDialog = async (confirm?: boolean) => {
    if (confirm) {
      await deleteMutation.mutate({ sensorId: sensorData._id });
    }
    setDeleteSensorDialogOpen(false);
  };

  return (
    <Card>
      <ConfirmDialog
        key="sensorDeleteDialog"
        warningText="This will permanently delete the sensor along with it's readings"
        handleClose={handleDeleteSensorDialog}
        open={deleteSensorDialogOpen}
      />
      <CardHeader
        subheader={
          <Grid container spacing={2}>
            <Grid size={11}>
              <Typography variant="h5" component="div">
                Sensor Details
              </Typography>
            </Grid>
            <Grid size={1}>
              <Tooltip title="Delete sensor">
                <IconButton onClick={handleDeleteSensor} edge="start">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        }
      >
      </CardHeader>
      <CardContent>
        <Typography sx={{my: 1.5 }} color="text.secondary">
          Name: {sensorData.name}
        </Typography>
        <Typography sx={{my: 1.5 }} color="text.secondary">
          Sensor ID: {sensorData._id}
        </Typography>
        <Typography sx={{my: 1.5 }} color="text.secondary">
          Sensor Type: {sensorData.type}
        </Typography>
      </CardContent>
    </Card>
  );
};