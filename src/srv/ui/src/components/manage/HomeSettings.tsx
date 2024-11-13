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
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';

import { HomeCreateDialog } from './HomeCreateDialog';
import { HomeEditDialog, EditHomeDetailsType } from './HomeEditDialog';
import { ConfirmDialog } from '../dialogs/ConfirmDialog';
import { HomeTokens } from './HomeTokens';
import { 
  useUserHomesWithTokens,
  useUserHomes
} from '../../hooks/useHome';
import { UserHomeDataResponse } from "../../api/home";
import { homeDeleteMutation } from '../../api/home';

const defaultHomeDetails = {
  _id: '',
  name: ''
}

export const HomeSettings = () => {
  const userHomesWithTokensApi = useUserHomesWithTokens();
  const userHomesApi = useUserHomes();
  const [ homeCreateOpen, setHomeCreateOpen ] = useState(false);
  const [ homeEditOpen, setHomeEditOpen ] = useState(false);
  const [ selectedHomeDetails, setSelectedHomeDetails ] = useState<EditHomeDetailsType>(defaultHomeDetails);
  const [ showTokenValues, setShowTokenValues ] = useState(false);
  const [ deleteHomeDialogOpen, setDeleteHomeDialogOpen ] = useState(false);
  const [ deleteHomeText, setDeleteHomeText ] = useState<string>();
  const [ deleteHomeId, setDeleteHomeId ] = useState<string | null>(null);

  const onModalClose = (refresh?: boolean) => {
    setHomeCreateOpen(false);
    setHomeEditOpen(false);
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

  const handleDeleteHome = async (homeId: string, homeName: string) => {
    setDeleteHomeId(homeId);
    setDeleteHomeText(`Confirm to delete home: ${homeName}. It will also delete all assigned tokens`);
    setDeleteHomeDialogOpen(true);
  }

  const handleDeleteHomeDialog = async (confirm?: boolean) => {
    setDeleteHomeDialogOpen(false);
    if (confirm && deleteHomeId) {
      await deleteMutation.mutateAsync({ homeId: deleteHomeId });
    }
    setDeleteHomeId(null);
  }

  const handleHomeEdit = async (homeDetails: UserHomeDataResponse) => {
    setSelectedHomeDetails(homeDetails);
    setHomeEditOpen(true);
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
          open={homeCreateOpen}
          handleClose={onModalClose}
        />
        <HomeEditDialog 
          open={homeEditOpen}
          homeDetails={selectedHomeDetails}
          handleClose={onModalClose}
        />
        <ConfirmDialog
          key="homeDeleteDialog"
          warningText={deleteHomeText}
          handleClose={handleDeleteHomeDialog}
          open={deleteHomeDialogOpen}
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
              <Grid size={10}>
                <Typography variant="h6" component="div">
                  {home.name}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Tooltip title="Edit home">
                  <IconButton onClick={() => handleHomeEdit(home)} edge="start">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid size={1}>
                <Tooltip title="Delete home">
                  <IconButton onClick={() => handleDeleteHome(home._id, home.name)} edge="start">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            <Typography color="text.secondary">
              Home ID: {home._id}
            </Typography>
            {home.notificationTopic && <Typography color="text.secondary">
              Notification Topic: {home.notificationTopic}
            </Typography>}
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
          onClick={() => setHomeCreateOpen(true)}
        >
          Add Home
        </Button>
      </CardContent>
    </Card>
  );
}