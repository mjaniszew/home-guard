import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import { AuthData } from "../../hooks/useAuth.js";

interface UserDetailsProps {
  auth: AuthData
}

export const AccountSettings = ({ auth } : UserDetailsProps) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          Account Details
        </Typography>
        <Typography sx={{my: 1.5 }} color="text.secondary">
          Username: {auth.username}
        </Typography>
        <Typography sx={{my: 1.5 }} color="text.secondary">
          User ID: {auth.userId}
        </Typography>
      </CardContent>
    </Card>
  );
}