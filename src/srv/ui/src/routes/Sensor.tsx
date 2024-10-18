import { useParams } from 'react-router-dom';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { SensorDetails } from '../components/sensors/SensorDetails';
import { SensorReadings } from '../components/sensors/SensorReadings';
import { useSensor, useSensorReadings } from '../hooks/useSensors';


export const Sensor = () => {
  const { sensorId } = useParams();
  const readingLimit = 50;
  const sensorDetails = useSensor(sensorId || '');
  const sensorReadings = useSensorReadings(sensorId || '', readingLimit);

  if (sensorDetails.isPending || sensorReadings.isLoading) {
    return <span>Loading User Homes...</span>
  }

  if (sensorDetails.isError || sensorReadings.isError) {
    return <span>Error: {sensorDetails.error?.message || sensorReadings.error?.message}</span>
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 2 }}>
        <Stack spacing={2}>
          <SensorDetails 
            sensorData={sensorDetails.data}
          />
          <SensorReadings 
            sensorReadings={sensorReadings.data}
            readingLimit={readingLimit}
          />
        </Stack>
      </Box>
    </Container>
  );
};