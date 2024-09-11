const streamData = [];
let webConnections = [];
let camConnections = [];

const onCamRegister = (socket, deviceId) => {
  camConnections.push({
    deviceId,
    socket,
    active: true,
    authenticated: false,
  });
  socket.send(JSON.stringify({
    action: 'REGISTER_AUTH'
  }));
}

const onWebClientRegister = (socket, clientId, token) => {
  webConnections.push({
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

const authenticateWebWs = (clientId, token, testToken) => {
  const webClient = webConnections.find(connection => connection.clientId === clientId);
  if (webClient && !!token && webClient.token === token) {
    webClient.authenticated = true;
  }
  return webClient && webClient.authenticated;
}

const authenticateCamWs = (deviceId, staticToken, clientToken) => {
  const camClient = camConnections.find(connection => connection.deviceId === deviceId);
  if (camClient && !!staticToken && staticToken === clientToken) {
    camClient.authenticated = true;
  }
  return camClient && camClient.authenticated;
}

const forceCloseWebWs = (clientId) => {
  const webClient = webConnections.find(connection => connection.clientId === clientId);
  if (webClient) {
    webClient.socket.close();
    webClient.authenticated = false;
    webClient.active = false;
  }
}

const forceCloseCamWs = (deviceId) => {
  const camClient = camConnections.find(connection => connection.deviceId === deviceId);
  if (camClient) {
    camClient.socket.close();
    camClient.authenticated = false;
    camClient.active = false;
  }
}

const streamPlay = () => {
  camConnections.forEach(stream => {
    if (stream.authenticated && stream.active) {
      stream.socket.send(JSON.stringify({
        action: 'STREAM_PLAY'
      }));
    }
  });
}

const streamStop = () => {
  camConnections.forEach(stream => {
    if (stream.authenticated && stream.active) {
      stream.socket.send(JSON.stringify({
        action: 'STREAM_STOP'
      }));
    }
  });
}

const streamDataReceiveid = (data) => {
  if (streamData.length > 20) {
    streamData.length = 0;
  }
  streamData.push(data);
}

async function routes (fastify, options) {
  const config = options.config;

  fastify.get('/api/monitoring/register-cam/:deviceId', { websocket: true }, (socket, req) => { 
    const { deviceId } = req.params;
    onCamRegister(socket, deviceId);
    fastify.log.info(`Cam client connected: ${deviceId}`); 

    const waitForAuth = setTimeout(() => { 
      forceCloseCamWs(deviceId);
    }, 5000);

    socket.on('message', event => {
      const parsedEvent = JSON.parse(event);
      fastify.log.info(`Server receivied event: ${parsedEvent.action} from ${deviceId}`);
      if (!authenticateCamWs(deviceId, parsedEvent.staticToken, config.authStaticToken)) { return }

      if (parsedEvent.action === 'REGISTER_AUTH') {
        clearTimeout(waitForAuth);
        socket.send(JSON.stringify({
          action: 'REGISTER_CONFIRM'
        }));
      }
      if (parsedEvent.action === 'STREAM_DATA') {
        streamDataReceiveid(parsedEvent.data);
      }
    });

    socket.on('close', () => {
      fastify.log.info(`Cam disconnected ${deviceId}`);
      const cams = camConnections.filter(connection => connection.deviceId === deviceId);
      cams.forEach(client => {
        camConnections.splice(camConnections.indexOf(client), 1);
      });
    });
  })

  fastify.get('/api/monitoring/register-webclient/:clientId', { 
      websocket: true,
    }, (socket, req) => {
    const { clientId } = req.params;
    const { token } = req.session.get('data') || {};
    
    onWebClientRegister(socket, clientId, token);
    fastify.log.info(`Cam client connected: ${clientId}`);

    const waitForAuth = setTimeout(() => { 
      forceCloseWebWs(clientId);
    }, 5000);
     
    socket.on('message', event => {
      const parsedEvent = JSON.parse(event);
      fastify.log.info(`Server receivied event: ${parsedEvent.action} from ${clientId}`);
      if (!authenticateWebWs(clientId, parsedEvent.token)) { return }

      if (parsedEvent.action === 'REGISTER_AUTH') {
        clearTimeout(waitForAuth);
        socket.send(JSON.stringify({
          action: 'REGISTER_CONFIRM'
        }));
      }
      if (parsedEvent.action === 'STREAM_PLAY') {
        streamPlay();
      }
    });

    socket.on('close', () => {
      fastify.log.info(`Web client disconnected ${clientId}`);
      const clients = webConnections.filter(connection => connection.clientId === clientId);
      clients.forEach(client => {
        webConnections.splice(webConnections.indexOf(client), 1);
      });
      if (!webConnections.length) {
        camConnections.forEach(connection => {
          streamStop();
        });
      }
    });
  })

  const clientsInterval = setInterval(() => {
    fastify.log.info('Web clients connected: %s', webConnections.length);
    fastify.log.info('Cam clients connected: %s', camConnections.length);
    if (webConnections.length > 20) {
      webConnections.forEach(connection => {
        connection.socket.close();
      });
      webConnections.length = 0;
    }
    if (camConnections.length > 20) {
      camConnections.forEach(connection => {
        connection.socket.close();
      });
      camConnections.length = 0;
    }
    if (!webConnections.length) {
      camConnections.forEach(connection => {
        streamStop(connection.socket);
      });
    }
  }, config.clientsInterval);

  const streamInterval = setInterval(() => {
    if (streamData.length) {
      const streamChunk = streamData.shift();
      webConnections.forEach(connection => {
        if (connection.authenticated && connection.active) {
          connection.socket.send(JSON.stringify({
            action: 'STREAM_DATA',
            data: streamChunk
          }));
        }
      });
    }
  }, config.streamReceiveInterval);
}

export {routes as monitoringRoutes};