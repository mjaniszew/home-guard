import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { CamsList } from '../components/monitoring/CamsList';
import { Sensors } from '../components/sensors/Sensors';

const Dashboard = () => {
  

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 2 }}>
        <Stack spacing={2}>
          <CamsList />
          <Sensors />
        </Stack>
      </Box>
    </Container>
  );
};

export { Dashboard };