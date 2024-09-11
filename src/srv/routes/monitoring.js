async function routes (fastify, options) {
  const config = options.config;
  const clientsHandler = options.clientsHandler;

  fastify.get('/api/monitoring/register-cam/:deviceId', { websocket: true }, (socket, req) => { 
    try {
      const { deviceId } = req.params;
      clientsHandler.onCamRegister(socket, deviceId);
      fastify.log.info(`Cam client connected: ${deviceId}`); 

      const waitForAuth = setTimeout(() => { 
        clientsHandler.forceCloseCamWs(deviceId);
      }, 5000);

      socket.on('message', event => {
        try {
          const parsedEvent = JSON.parse(event);
          fastify.log.info(`Server receivied event: ${parsedEvent.action} from ${deviceId}`);
          if (!clientsHandler.authenticateCamWs(deviceId, parsedEvent.staticToken, config.authStaticToken)) { return }

          if (parsedEvent.action === 'REGISTER_AUTH') {
            clearTimeout(waitForAuth);
            socket.send(JSON.stringify({
              action: 'REGISTER_CONFIRM'
            }));
          }
          if (parsedEvent.action === 'STREAM_DATA') {
            clientsHandler.streamDataReceiveid(parsedEvent.data);
          }
        } catch (error) {
          fastify.log.error(error);
        }
      });

      socket.on('close', () => {
        try {
          fastify.log.info(`Cam disconnected ${deviceId}`);
          const cams = clientsHandler.camConnections.filter(connection => connection.deviceId === deviceId);
          cams.forEach(client => {
            clientsHandler.camConnections.splice(clientsHandler.camConnections.indexOf(client), 1);
          });
        } catch (error) {
          fastify.log.error(error);
        }
      });
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.get('/api/monitoring/register-webclient/:clientId', { 
      websocket: true,
    }, (socket, req) => {
    try {
      const { clientId } = req.params;
      const { token } = req.session.get('data') || {};
      
      clientsHandler.onWebClientRegister(socket, clientId, token);
      fastify.log.info(`Cam client connected: ${clientId}`);

      const waitForAuth = setTimeout(() => { 
        clientsHandler.forceCloseWebWs(clientId);
      }, 5000);
      
      socket.on('message', event => {
        try {
          const parsedEvent = JSON.parse(event);
          fastify.log.info(`Server receivied event: ${parsedEvent.action} from ${clientId}`);
          if (!clientsHandler.authenticateWebWs(clientId, parsedEvent.token)) { return }

          if (parsedEvent.action === 'REGISTER_AUTH') {
            clearTimeout(waitForAuth);
            socket.send(JSON.stringify({
              action: 'REGISTER_CONFIRM'
            }));
          }
          if (parsedEvent.action === 'STREAM_PLAY') {
            clientsHandler.streamPlay();
          }
        } catch (error) {
          fastify.log.error(error);
        }
      });

      socket.on('close', () => {
        try {
          fastify.log.info(`Web client disconnected ${clientId}`);
          const clients = clientsHandler.webConnections.filter(connection => connection.clientId === clientId);
          clients.forEach(client => {
            clientsHandler.webConnections.splice(clientsHandler.webConnections.indexOf(client), 1);
          });
          if (!clientsHandler.webConnections.length) {
            clientsHandler.camConnections.forEach(connection => {
              clientsHandler.streamStop();
            });
          }
        } catch (error) {
          fastify.log.error(error);
        }
      });
    } catch (error) {
      fastify.log.error(error);
    }
  })

  clientsHandler.initIntervals();
}

export {routes as monitoringRoutes};