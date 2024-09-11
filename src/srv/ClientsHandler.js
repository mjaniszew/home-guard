const ClientsHandler = class {
  config;
  logger;
  streamData;
  webConnections;
  camConnections;
  
  constructor(options) {
    this.config = options.config;
    this.streamData = [];
    this.webConnections = [];
    this.camConnections = [];
  }

  setLogger = (logger) => {
    this.logger = logger;
  }
  
  onCamRegister = (socket, deviceId) => {
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
  
  onWebClientRegister = (socket, clientId, token) => {
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
  
  authenticateWebWs = (clientId, token) => {
    const webClient = this.webConnections.find(connection => connection.clientId === clientId);
    if (webClient && !!token && webClient.token === token) {
      webClient.authenticated = true;
    }
    return webClient && webClient.authenticated;
  }
  
  authenticateCamWs = (deviceId, staticToken, clientToken) => {
    const camClient = this.camConnections.find(connection => connection.deviceId === deviceId);
    if (camClient && !!staticToken && staticToken === clientToken) {
      camClient.authenticated = true;
    }
    return camClient && camClient.authenticated;
  }
  
  forceCloseWebWs = (clientId) => {
    const webClient = this.webConnections.find(connection => connection.clientId === clientId);
    if (webClient) {
      webClient.socket.close();
      webClient.authenticated = false;
      webClient.active = false;
    }
  }
  
  forceCloseCamWs = (deviceId) => {
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
  
  streamDataReceiveid = (data) => {
    if (this.streamData.length > 20) {
      this.streamData.length = 0;
    }
    this.streamData.push(data);
  }

  initIntervals = () => {
    setInterval(() => {
      try {
        this.logger.info('Web clients connected: %s', this.webConnections.length);
        this.logger.info('Cam clients connected: %s', this.camConnections.length);
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
            this.streamStop(connection.socket);
          });
        }
      } catch (error) {
        this.logger.error(error);
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
        this.logger.error(error);
      }
    }, this.config.streamReceiveInterval);
  }
}

export { ClientsHandler };