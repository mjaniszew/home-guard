import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';


import { useUserHome } from '../../hooks/useHome.js';
import { Stack } from '@mui/material';
import { SensorAddDialog } from './SensorAddDialog.js';


export const Sensors = () => {
  const [ sensorDialogOpen, setSensorDialogOpen ] = useState(false);
  const userHome = useUserHome();

  const refreshData = () => {

  }

  const onModalClose = () => {
    setSensorDialogOpen(false);
  }

  return (
    <Card>
      {!userHome.isLoading && <SensorAddDialog 
        homeId={userHome.selectedHome}
        open={sensorDialogOpen}
        handleClose={onModalClose}
      />}
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
          <Table>
            <TableBody>
            </TableBody>
          </Table>
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