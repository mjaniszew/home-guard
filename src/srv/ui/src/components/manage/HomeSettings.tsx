import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import { HomeTokens } from './HomeTokens.js';
import { useUserHomes } from '../api/home.js';

export const HomeSettings = () => {
  const { data, error, isPending, isError, refetch } = useUserHomes();
  const [ showTokenValues, setShowTokenValues ] = useState(false);

  if (isPending) {
    return <span>Loading User Homes...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          Home Details
        </Typography>
        <Typography color="text.secondary">
          Manage your static tokens for your devices
        </Typography>
        {data.map((home) => (
          <Paper key={home._id} elevation={3} sx={{my: 1, p: 2}}>
            <Typography variant="h6" component="div">
              {home.name}
            </Typography>
            <Typography color="text.secondary">
              Home ID: {home._id}
            </Typography>
            <FormGroup>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={showTokenValues} 
                    onChange={() => {setShowTokenValues(!showTokenValues)}}
                  />
                } 
                label="Show token values"
              />
            </FormGroup>
            <HomeTokens 
              homeId={home._id}
              homeName={home.name}
              tokens={home.tokens}
              showTokenValues={showTokenValues}
              refetchData={refetch}
            />
          </Paper>
        ))}
      </CardContent>
    </Card>
  );
}