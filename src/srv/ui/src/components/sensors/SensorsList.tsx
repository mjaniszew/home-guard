import { useNavigate } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import {
  getSensorIcon,
  formatSensorValue,
  getSensorStateColor
} from './SensorTypes';

import { 
  HomeSensorCurrentResponse
} from '../../api/sensors';

interface SensorsListProps {
  homeSensors: HomeSensorCurrentResponse[];
};

export const SensorsList = ({ homeSensors }: SensorsListProps) => {
  const navigate = useNavigate();

  return homeSensors.length ? (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell align="right">Last Reading</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {homeSensors.map((sensor, index) => (
          <TableRow 
            hover
            sx={{ cursor: 'pointer' }}
            key={index} 
            onClick={(event) => {
              event.preventDefault();
              navigate(`/sensor/${sensor._id}`);
            }
          }>
            <TableCell scope="row">
              <Link href={`/sensor/${sensor._id}`}>
                {sensor.name}
              </Link>
            </TableCell>
            <TableCell align="right">
              {sensor.lastReading[0] ? 
                <Chip 
                  icon={getSensorIcon(sensor.type)}
                  label={
                    formatSensorValue(sensor.lastReading[0].value, sensor.type)
                  }
                  color={getSensorStateColor(sensor.lastReading[0].value, sensor.type)}
                /> : 
                <Chip label="Offline" color="default" />
              }
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <Typography>
      No sensors found
    </Typography>
  );
}