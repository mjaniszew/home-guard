import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import LoginIcon from '@mui/icons-material/Login';

import { loginMutation } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';

type ErrorResponse = AxiosError & {
  data: {
    error: string
  }
};

const LoginForm = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>();
  const { authenticate } = useAuth();
  const { mutateAsync } = useMutation({
    mutationFn: loginMutation,
    onError: (err: Error & {response: ErrorResponse}) => {
      setError(err.response.data?.error);
    },
    onSuccess: (data) => {
      authenticate(data);
    },
  });

  const handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    await mutateAsync({ username, password });
  };

  return (
    <Box component="form" autoComplete='off' sx={{ my: 2 }}>
      <Stack spacing={2}>
        <TextField 
          id="username" 
          label="User" 
          variant="outlined"
          onChange={(event) => setUsername(event.target.value)}
          error={!!error}
          required
        />
        <TextField 
          id="password" 
          label="Password" 
          type="password" 
          variant="outlined" 
          onChange={(event) => setPassword(event.target.value)}
          helperText={error}
          error={!!error}
          required
        />
        <Button 
          variant="outlined"
          type="submit"
          onClick={handleSubmit}
          disabled={!username || !password}
          endIcon={<LoginIcon/>}
        >Login</Button>
      </Stack>
    </Box>
  );
};

export { LoginForm };