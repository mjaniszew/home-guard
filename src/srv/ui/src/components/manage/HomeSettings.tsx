import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

import { HomeCreateDialog } from './HomeCreateDialog';
import { HomeTokens } from './HomeTokens.js';
import { useUserHomesWithTokens, useUserHomes} from '../../api/home.js';
import { Button } from '@mui/material';
import { homeDeleteMutation } from '../../api/home.js';

export const HomeSettings = () => {
  const userHomesWithTokensApi = useUserHomesWithTokens();
  const userHomesApi = useUserHomes();
  const [ homeDialogOpen, setHomeDialogOpen ] = useState(false);
  const [ showTokenValues, setShowTokenValues ] = useState(false);

  const onModalClose = (refresh?: boolean) => {
    setHomeDialogOpen(false);
    if (refresh) {
      userHomesWithTokensApi.refetch();
    }
  }

  const deleteMutation = useMutation({
    mutationFn: homeDeleteMutation,
    onSuccess: () => {
      userHomesWithTokensApi.refetch();
      userHomesApi.refetch();
    }
  });

  const handleDeleteHome = async (homeId: string) => {
    await deleteMutation.mutateAsync({ homeId });
  }

  if (userHomesWithTokensApi.isPending) {
    return <span>Loading User Homes...</span>
  }

  if (userHomesWithTokensApi.isError) {
    return <span>Error: {userHomesWithTokensApi.error.message}</span>
  }

  return (
    <Card>
      <CardContent>
        <HomeCreateDialog 
          open={homeDialogOpen}
          handleClose={onModalClose}
        />
        <Typography variant="h5" component="div">
          Home Details
        </Typography>
        <Typography color="text.secondary">
          Manage your homes static tokens for your devices
        </Typography>
        {userHomesWithTokensApi.data.map((home) => (
          <Paper key={home._id} elevation={3} sx={{my: 1, p: 2}}>
            <Grid container spacing={2}>
              <Grid size={11}>
                <Typography variant="h6" component="div">
                  {home.name}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Tooltip title="Delete token">
                  <IconButton onClick={() => handleDeleteHome(home._id)} edge="start">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
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
              refetchData={userHomesWithTokensApi.refetch}
            />
          </Paper>
        ))}
        <Button 
          variant="outlined"
          onClick={() => setHomeDialogOpen(true)}
        >
          Add Home
        </Button>
      </CardContent>
    </Card>
  );
}