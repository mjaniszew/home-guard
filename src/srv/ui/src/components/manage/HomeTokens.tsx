import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import AddBoxIcon from '@mui/icons-material/AddBox';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';
import { useCopyToClipboard } from 'usehooks-ts';

import { HomeTokenResponse } from "../../api/home.js"
import { tokenDeleteMutation } from '../../api/home.js';
import { HomeTokenCreateDialog } from './HomeTokenDialog.js';

interface UserDetailsProps {
  homeId: string,
  homeName: string,
  showTokenValues?: boolean,
  tokens: HomeTokenResponse[],
  refetchData: () => void
}

export const HomeTokens = ({ homeId, homeName, tokens, showTokenValues, refetchData } : UserDetailsProps) => {
  const [_copiedText, copy] = useCopyToClipboard();
  const [ dialogOpen, setDialogOpen ] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: tokenDeleteMutation,
    onSuccess: refetchData
  });

  const handleDeleteToken = async (tokenId: string) => {
    await deleteMutation.mutateAsync({ homeId, tokenId });
  }

  const handleCopyToken = (value: string) => {
    copy(value);
  }

  const onModalClose = (refresh?: boolean) => {
    setDialogOpen(false);
    if (refresh) {
      refetchData();
    }
  }

  const StyledListItemText = styled(ListItemText)({
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    marginRight: 42
  });

  return (
    <Paper elevation={0} sx={{ mt: 3}}>
      <HomeTokenCreateDialog 
        open={dialogOpen}
        homeId={homeId}
        homeName={homeName}
        handleClose={onModalClose}
      />
      <List
        component="nav"
      >
        { tokens.map((token) => (
          <ListItem
            key={token._id}
            secondaryAction={
              <>
                <Tooltip title="Copy to Clipboard">
                  <IconButton onClick={() => handleCopyToken(token.value)}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete token">
                  <IconButton onClick={() => handleDeleteToken(token._id)} edge="end">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            }
          >
            <StyledListItemText 
              primary={token.name}
              secondary={showTokenValues && token.value}
            />
          </ListItem>
        ))}
        <ListItemButton key="createToken" onClick={() => setDialogOpen(true)}>
          <AddBoxIcon sx={{mx: 1}} />
          <ListItemText primary="Create Token" />
        </ListItemButton>
      </List>
    </Paper>
  );
}