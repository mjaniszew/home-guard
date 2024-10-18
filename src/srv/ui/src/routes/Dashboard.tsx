import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { CamsList } from '../components/monitoring/CamsList';
import { Sensors } from '../components/sensors/Sensors';
import { useUserHome } from '../hooks/useHome.js';

const Dashboard = () => {
  const userHome = useUserHome();

  if (userHome.isLoading || !userHome.selectedHome) {
    return <span>Loading home data...</span>;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 2 }}>
        <Stack spacing={2}>
          <CamsList />
          <Sensors homeId={userHome.selectedHome} />
        </Stack>
      </Box>
    </Container>
  );
};

export { Dashboard };