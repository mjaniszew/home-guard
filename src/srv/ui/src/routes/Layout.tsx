import Container from '@mui/material/Container';
import { AppTopBar } from '../components/app/AppTopBar';

export const Layout = ({ children }: { children: React.ReactNode }) => {

  return (
    <Container maxWidth={false} className="appRootContainer">
      <AppTopBar />
      {children}
    </Container>
  );
};