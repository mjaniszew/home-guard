import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import { HomeSensorResponse } from '../../api/sensors';

interface UserDetailsProps {
  sensorData: HomeSensorResponse;
}

export const SensorDetails = ({ sensorData }: UserDetailsProps) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          Sensor Details
        </Typography>
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