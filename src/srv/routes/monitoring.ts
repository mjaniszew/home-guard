import { 
  FastifyInstance,
  RouteShorthandOptions,
} from 'fastify';

import { 
  WebConnectionType,
  CamConnectionType,
  ClientsHandlerType 
} from '../ClientsHandler.js';
import { ConfigType } from '../config.js';

type RouteOptions = RouteShorthandOptions & {
  config: ConfigType,
  clientsHandler: ClientsHandlerType,
};

type RegisterParams = {
  deviceId?: string,
  clientId?: string
};

async function routes (fastify: FastifyInstance, options: RouteOptions) {
  const { config, clientsHandler } = options;

  fastify.get('/api/monitoring/register-cam/:deviceId', { websocket: true }, (socket, req) => { 
    try {
      const { deviceId } = req.params as RegisterParams;

      if (!deviceId) {
        return;
      }
      
      clientsHandler.onCamRegister(socket, deviceId);
      fastify.log.info(`Cam client connected: ${deviceId}`); 

      const waitForAuth = setTimeout(() => { 
        clientsHandler.forceCloseCamWs(deviceId);
      }, 5000);

      socket.on('message', (event: string) => {
        try {
          const parsedEvent = JSON.parse(event);
          fastify.log.info(`Server receivied event: ${parsedEvent.action} from ${deviceId}`);
          if (!clientsHandler.authenticateCamWs(
            deviceId, parsedEvent.staticToken, config.authStaticToken
          )) { 
            return;
          }

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
          const cams = clientsHandler.camConnections.filter(
            (connection: CamConnectionType) => connection.deviceId === deviceId
          );
          cams.forEach((client: CamConnectionType) => {
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
      const { clientId } = req.params as RegisterParams;
      let token = null;

      if (req.headers.cookie) {
        const cookies = fastify.parseCookie(req.headers.cookie);
        token = JSON.parse(cookies.auth)?.token;
      }
      
      if (!clientId || !fastify.jwt.verify(token)) {
        return;
      }

      clientsHandler.onWebClientRegister(socket, clientId, token);
      fastify.log.info(`Cam client connected: ${clientId}`);

      const waitForAuth = setTimeout(() => { 
        clientsHandler.forceCloseWebWs(clientId);
      }, 5000);
      
      socket.on('message', (event: string) => {
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
          const clients = clientsHandler.webConnections.filter(
            (connection: WebConnectionType) => connection.clientId === clientId
          );
          clients.forEach((client: WebConnectionType) => {
            clientsHandler.webConnections.splice(clientsHandler.webConnections.indexOf(client), 1);
          });
          if (!clientsHandler.webConnections.length) {
            clientsHandler.camConnections.forEach((connection: CamConnectionType) => {
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