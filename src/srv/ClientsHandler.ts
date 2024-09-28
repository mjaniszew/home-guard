import WebSocket from "ws";
import { 
  FastifyBaseLogger
} from 'fastify';

import { ConfigType } from "./config.js";

export type WebConnectionType = {
  clientId: string,
  socket: WebSocket,
  active: boolean,
  authenticated: boolean,
  token: string,
}

export type CamConnectionType = {
  deviceId: string,
  socket: WebSocket,
  active: boolean,
  authenticated: boolean,
}

type ClientsHandlerOptionsType = {
  config: ConfigType
}

const ClientsHandler = class {
  private config: ConfigType;
  private logger: FastifyBaseLogger | null;
  private streamData: string[];
  webConnections: WebConnectionType[];
  camConnections: CamConnectionType[];
  
  constructor(options: ClientsHandlerOptionsType) {
    this.config = options.config;
    this.logger = null;
    this.streamData = [];
    this.webConnections = [];
    this.camConnections = [];
  }

  setLogger = (logger: FastifyBaseLogger) => {
    this.logger = logger;
  }
  
  onCamRegister = (socket: WebSocket, deviceId: string) => {
    this.camConnections.push({
      deviceId,
      socket,
      active: true,
      authenticated: false,
    });
    socket.send(JSON.stringify({
      action: 'REGISTER_AUTH'
    }));
  }
  
  onWebClientRegister = (socket: WebSocket, clientId: string, token: string) => {
    this.webConnections.push({
      clientId,
      socket,
      active: true,
      authenticated: false,
      token
    });
    socket.send(JSON.stringify({
      action: 'REGISTER_AUTH'
    }));
  }
  
  authenticateWebWs = (clientId: string, token: string): boolean => {
    const webClient = this.webConnections.find(connection => connection.clientId === clientId);
    if (webClient && !!token && webClient.token === token) {
      webClient.authenticated = true;
    }
    return Boolean(webClient && webClient.authenticated);
  }
  
  authenticateCamWs = (deviceId: string, staticToken: string, clientToken: string): boolean => {
    const camClient = this.camConnections.find(connection => connection.deviceId === deviceId);
    if (camClient && !!staticToken && staticToken === clientToken) {
      camClient.authenticated = true;
    }
    return Boolean(camClient && camClient.authenticated);
  }
  
  forceCloseWebWs = (clientId: string) => {
    const webClient = this.webConnections.find(connection => connection.clientId === clientId);
    if (webClient) {
      webClient.socket.close();
      webClient.authenticated = false;
      webClient.active = false;
    }
  }
  
  forceCloseCamWs = (deviceId: string) => {
    const camClient = this.camConnections.find(connection => connection.deviceId === deviceId);
    if (camClient) {
      camClient.socket.close();
      camClient.authenticated = false;
      camClient.active = false;
    }
  }
  
  streamPlay = () => {
    this.camConnections.forEach(stream => {
      if (stream.authenticated && stream.active) {
        stream.socket.send(JSON.stringify({
          action: 'STREAM_PLAY'
        }));
      }
    });
  }
  
  streamStop = () => {
    this.camConnections.forEach(stream => {
      if (stream.authenticated && stream.active) {
        stream.socket.send(JSON.stringify({
          action: 'STREAM_STOP'
        }));
      }
    });
  }
  
  streamDataReceiveid = (data: string) => {
    if (this.streamData.length > 20) {
      this.streamData.length = 0;
    }
    this.streamData.push(data);
  }

  initIntervals = () => {
    setInterval(() => {
      try {
        this.logger?.info('Web clients connected: %s', this.webConnections.length);
        this.logger?.info('Cam clients connected: %s', this.camConnections.length);
        if (this.webConnections.length > 20) {
          this.webConnections.forEach(connection => {
            connection.socket.close();
          });
          this.webConnections.length = 0;
        }
        if (this.camConnections.length > 20) {
          this.camConnections.forEach(connection => {
            connection.socket.close();
          });
          this.camConnections.length = 0;
        }
        if (!this.webConnections.length) {
          this.camConnections.forEach(_connection => {
            this.streamStop();
          });
        }
      } catch (error) {
        this.logger?.error(error);
      }
    }, this.config.clientsInterval);
  
    setInterval(() => {
      try {
        if (this.streamData.length) {
          const streamChunk = this.streamData.shift();
          this.webConnections.forEach(connection => {
            if (connection.authenticated && connection.active) {
              connection.socket.send(JSON.stringify({
                action: 'STREAM_DATA',
                data: streamChunk
              }));
            }
          });
        }
      } catch (error) {
        this.logger?.error(error);
      }
    }, this.config.streamReceiveInterval);
  }
}

type ClientsHandlerType = InstanceType<typeof ClientsHandler>

export { ClientsHandler, ClientsHandlerType };