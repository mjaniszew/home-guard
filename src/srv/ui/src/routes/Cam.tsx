import { useState} from "react";
import { useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import { CamFeed } from "../components/monitoring/CamFeed";
import { useWebConfig } from "../components/api/general";
import { useAuth } from "../hooks/useAuth";

export const Cam = () => {
  const { id } = useParams();
  const { auth } = useAuth();
  const config = useWebConfig();
  const [ fullPage, setFullPage ] = useState(false);

  const toggleFullPage = () => {
    setFullPage(!fullPage);
  };

  if (config.isPending) {
    return <span>Loading...</span>;
  }

  if (config.isError) {
    return <span>Error: {config.error.message}</span>
  }

  return (
    <Container 
      className={fullPage ? 'fullPageContainer' : 'normal'}
      sx={{my: 2}}
    >
      <CamFeed 
        camId={id}
        auth={auth}
        config={config.data} 
        fullPage={fullPage}
        toggleFullPage={toggleFullPage}
      />
    </Container>
  )
};