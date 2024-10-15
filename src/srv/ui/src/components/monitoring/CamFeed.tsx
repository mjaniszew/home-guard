import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { ConfigData } from '../../api/general';
import { AuthData } from '../../hooks/useAuth';
import { useUserHome } from '../../hooks/useHome';

interface CamFeedProps {
  camId?: string,
  auth: AuthData,
  config: ConfigData,
  fullPage: boolean,
  toggleFullPage: () => void
}

enum WS_MESSAGES {
  REGISTER_AUTH = 'REGISTER_AUTH',
  REGISTER_CONFIRM = 'REGISTER_CONFIRM',
  STREAM_PLAY = 'STREAM_PLAY',
  STREAM_STOP = 'STREAM_STOP',
  STREAM_DATA = 'STREAM_DATA'
}

const CamFeed = ({ camId, auth, config, fullPage, toggleFullPage }: CamFeedProps) => {
  const [ webSocketConnection, setWebSocketConnection ] = useState<WebSocket | null>(null);
  const [ feedData, setFeedData ] = useState<string>('');
  const userHome = useUserHome();
  const { connectionSecure, serverHost } = config;

  const sendPlayAction = () => {
    webSocketConnection?.send(JSON.stringify({
      action: WS_MESSAGES.STREAM_PLAY,
      token: auth.token
    }));
  }

  const sendWsAuth = () => {
    webSocketConnection?.send(JSON.stringify({
      action: WS_MESSAGES.REGISTER_AUTH,
      token: auth.token
    }));
  }

  useEffect(() => {
    const clientId = `web-${Math.floor(Math.random() * 10000)}`;
    const socket = new WebSocket(
      `${connectionSecure? 'wss' : 'ws'}://${serverHost}/api/monitoring/register-webclient/${userHome.selectedHome}/${clientId}/${camId}`,
    );
    setWebSocketConnection(socket);

    return () => {
      if (socket?.readyState !== socket?.CONNECTING) {
        socket?.close();
      }
    };
  }, [connectionSecure, serverHost, userHome]);

  useEffect(() => {
    if (!webSocketConnection) return;

    const onMessageHandler = (event: MessageEvent) => {
      const parsedEvent = JSON.parse(event.data);

      if (parsedEvent.action === WS_MESSAGES.REGISTER_AUTH) {
        sendWsAuth();
      }
      if (parsedEvent.action === WS_MESSAGES.REGISTER_CONFIRM) {
        sendPlayAction();
      }
      if (parsedEvent.action === WS_MESSAGES.STREAM_DATA) {
        setFeedData(parsedEvent.data);
      }
    };

    webSocketConnection.onmessage = onMessageHandler;

    return () => {
      webSocketConnection.removeEventListener('message', onMessageHandler);
    };
  }, [webSocketConnection]);

  return (
    <Card elevation={3} >
      <CardHeader
        action={
          <Button 
            sx={{m: 0.5}}
            variant="outlined"
            onClick={toggleFullPage}
            endIcon={fullPage ? <CloseFullscreenIcon /> : <FullscreenIcon /> }
          >{fullPage ? 'Minimize' : 'Expand' }</Button>
        }
        title={`Feed: ${camId}`}
      >
      </CardHeader>
      <CardContent>
        <img
          id="camStream"
          style={{width: '100%'}}
          src={feedData}
        />
      </CardContent>
    </Card>
  );
};

export { CamFeed };