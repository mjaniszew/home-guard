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
  homeId: string,
  tokens: string[],
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
  private streamData: Record<string, string[]>;
  webConnections: WebConnectionType[];
  camConnections: CamConnectionType[];
  
  constructor(options: ClientsHandlerOptionsType) {
    this.config = options.config;
    this.logger = null;
    this.streamData = {};
    this.webConnections = [];
    this.camConnections = [];
  }

  setLogger = (logger: FastifyBaseLogger) => {
    this.logger = logger;
  }
  
  onCamRegister = (socket: WebSocket, deviceId: string, homeId: string, tokens: string[]) => {
    this.camConnections.push({
      deviceId,
      homeId,
      tokens,
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
  
  authenticateCamWs = (deviceId: string, staticToken: string): boolean => {
    const camClient = this.camConnections.find(connection => connection.deviceId === deviceId);
    if (camClient && !!staticToken && camClient.tokens.find(tkn => tkn === staticToken)) {
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
  
  streamPlay = (deviceId: string) => {
    const camConnection = this.camConnections.find(
      connection => connection.deviceId === deviceId
    );

    if (camConnection?.authenticated && camConnection?.active) {
      camConnection.socket.send(JSON.stringify({
        action: 'STREAM_PLAY'
      }));
    }
  }
  
  streamStop = (deviceId: string) => {
    const camConnection = this.camConnections.find(
      connection => connection.deviceId === deviceId
    );

    if (camConnection?.authenticated && camConnection?.active) {
      camConnection.socket.send(JSON.stringify({
        action: 'STREAM_STOP'
      }));
    }
  }
  
  streamDataReceiveid = (deviceId: string, data: string) => {
    if (!this.streamData[deviceId]) {
      this.streamData[deviceId] = [];
    }

    if (this.streamData[deviceId].length > 20) {
      this.streamData[deviceId].length = 0;
    }
    this.streamData[deviceId].push(data);
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
          this.camConnections.forEach(connection => {
            this.streamStop(connection.deviceId);
          });
        }
      } catch (error) {
        this.logger?.error(error);
      }
    }, this.config.clientsInterval);
  
    setInterval(() => {
      try {
        Object.keys(this.streamData).forEach((deviceId) => {
          if (this.streamData[deviceId].length) {
            const streamChunk = this.streamData[deviceId].shift();
            this.webConnections.forEach(connection => {
              if (connection.authenticated && connection.active) {
                connection.socket.send(JSON.stringify({
                  action: 'STREAM_DATA',
                  data: streamChunk
                }));
              }
            });
          }
        })
      } catch (error) {
        this.logger?.error(error);
      }
    }, this.config.streamReceiveInterval);
  }
}

type ClientsHandlerType = InstanceType<typeof ClientsHandler>

export { ClientsHandler, ClientsHandlerType };