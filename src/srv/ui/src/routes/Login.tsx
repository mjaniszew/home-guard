import { Navigate } from "react-router-dom";
import { LoginForm } from '../components/auth/LoginForm.js';
import { useAuth } from '../hooks/useAuth.js';
import Container from '@mui/material/Container';

const Login = () => {
  const { auth } = useAuth();
  const navigateToLogin = (<Navigate to="/dashboard" />);
  const loginForm = (        
    <Container maxWidth="sm">
      <LoginForm />
    </Container>
  )

  return (
    <>
      { 
        auth.username && auth.token? navigateToLogin : loginForm
      }
    </>
  );
};

export { Login };