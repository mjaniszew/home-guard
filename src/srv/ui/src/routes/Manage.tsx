import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { useAuth } from '../hooks/useAuth';
import { AccountSettings } from '../components/manage/AccountSettings';
import { HomeSettings } from '../components/manage/HomeSettings';


export const Manage = () => {
  const { auth } = useAuth();

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 2 }}>
        <Stack spacing={2}>
          <AccountSettings auth={auth} />
          <HomeSettings />
        </Stack>
      </Box>
    </Container>
  );
};