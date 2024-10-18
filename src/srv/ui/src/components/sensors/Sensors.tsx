import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import Paper from '@mui/material/Paper';

import { Stack } from '@mui/material';
import { SensorAddDialog } from './SensorAddDialog.js';
import { SensorsList } from './SensorsList.js';

import { useHomeSensorsCurrentReadings } from '../../hooks/useSensors';

interface SensorsProps {
  homeId: string;
};

export const Sensors = ({ homeId }: SensorsProps) => {
  const [ sensorDialogOpen, setSensorDialogOpen ] = useState(false);
  const homeSensors = useHomeSensorsCurrentReadings(homeId);

  const refreshData = () => {
    homeSensors.refetch();
  }

  const onModalClose = (refresh?: boolean) => {
    setSensorDialogOpen(false);
    if (refresh) {
      refreshData();
    }
  }

  return (
    <Card>
      <SensorAddDialog 
        homeId={homeId}
        open={sensorDialogOpen}
        handleClose={onModalClose}
      />
      <CardContent>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={11}>
              <Typography variant="h5" component="div">
                Sensors
              </Typography>
            </Grid>
            <Grid size={1}>
              <Tooltip title="Refresh data">
                <IconButton onClick={refreshData} edge="start">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          <Paper elevation={4}>
            <SensorsList
              homeSensors={homeSensors.data || []}
            />
          </Paper>
          <Button 
            variant="outlined"
            onClick={() => setSensorDialogOpen(true)}
          >
            Add Sensor
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}