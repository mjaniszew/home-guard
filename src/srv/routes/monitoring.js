const streamData = [];
let webConnections = [];
let camConnections = [];

const onCamRegister = (socket, deviceId) => {
  camConnections.push({
    clientId: deviceId,
    socket: socket,
    active: true
  });
  socket.send(JSON.stringify({
    action: 'STREAM_STOP'
  }));
}

const onWebClientRegister = (socket, clientId) => {
  webConnections.push({
    clientId: clientId,
    socket: socket,
    active: true
  });
  socket.send(JSON.stringify({
    action: 'REGISTER_CONFIRM'
  }));
}

const streamPlay = (socket) => {
  camConnections.forEach(stream => {
    stream.socket.send(JSON.stringify({
      action: 'STREAM_PLAY'
    }));
  });
}

const streamStop = (socket) => {
  camConnections.forEach(stream => {
    stream.socket.send(JSON.stringify({
      action: 'STREAM_STOP'
    }));
  });
}

const streamDataReceiveid = (socket, data) => {
  streamData.push(data);
}

async function routes (fastify, options) {
  fastify.get('/api/monitoring/register-cam/:deviceId', { websocket: true }, (socket, req) => { 
    const { deviceId } = req.params;
    onCamRegister(socket, deviceId);
    fastify.log.info(`Cam client connected: ${deviceId}`); 

    socket.on('message', event => {
      const parsedEvent = JSON.parse(event);
      if (parsedEvent.action === 'STREAM_DATA') {
        streamDataReceiveid(socket, parsedEvent.data);
      }
    });
  })

  fastify.get('/api/monitoring/register-webclient/:clientId', { websocket: true }, (socket, req) => {   
    const { clientId } = req.params;
    onWebClientRegister(socket, clientId);
    fastify.log.info(`Cam client connected: ${clientId}`);
     
    socket.on('message', event => {
      const parsedEvent = JSON.parse(event);
      fastify.log.info(`Server receivied event: ${parsedEvent.action} from ${clientId}`);

      if (parsedEvent.action === 'STREAM_PLAY') {
        streamPlay(socket, parsedEvent);
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
          streamStop(connection.socket);
        });
      }
    });
  })

  const clientsInterval = setInterval(() => {
    fastify.log.info('Web clients connected: %s', webConnections.length);
    fastify.log.info('Cam clients connected: %s', camConnections.length);
    // webConnections = webConnections.map(connection => connection.active);
    if (!webConnections.length) {
      camConnections.forEach(connection => {
        streamStop(connection.socket);
      });
    }
  }, 10000);

  const streamInterval = setInterval(() => {
    if (streamData.length) {
      const streamChunk = streamData.shift();
      webConnections.forEach(connection => {
        connection.socket.send(JSON.stringify({
          action: 'STREAM_DATA',
          data: streamChunk
        }));
      });
    }
  }, 200);
}

export {routes as monitoringRoutes};