import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import Stack from '@mui/material/Stack';

import {
  formatSensorValue,
} from './SensorTypes';
import { 
  SensorReadingResponse,
  SENSOR_TYPES
} from '../../api/sensors';

interface SensorsListProps {
  sensorReadings: SensorReadingResponse[];
  readingLimit: number;
  sensorType: SENSOR_TYPES;
};

export const SensorReadings = ({ sensorReadings, readingLimit, sensorType }: SensorsListProps) => {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5" component="div">
            Sensor Readings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Last {readingLimit} records
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Reading</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sensorReadings.map((reading, index) => (
                <TableRow key={index} >
                  <TableCell>
                    {new Date(reading.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell scope="row" align="right">
                    {formatSensorValue(reading.value, sensorType)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </CardContent>
    </Card>
  );
};