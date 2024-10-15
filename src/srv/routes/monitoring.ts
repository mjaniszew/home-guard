import { 
  FastifyInstance,
  RouteShorthandOptions,
} from 'fastify';
import { ObjectId } from '@fastify/mongodb';

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
  homeId?: string,
  deviceId?: string,
  clientId?: string
};

enum WS_MESSAGES {
  REGISTER_AUTH = 'REGISTER_AUTH',
  REGISTER_CONFIRM = 'REGISTER_CONFIRM',
  STREAM_PLAY = 'STREAM_PLAY',
  STREAM_STOP = 'STREAM_STOP',
  STREAM_DATA = 'STREAM_DATA'
}

async function routes (fastify: FastifyInstance, options: RouteOptions) {
  const { config, clientsHandler } = options;

  fastify.get('/api/monitoring/register-cam/:homeId/:deviceId', { 
    websocket: true 
  }, async (socket, req) => { 
    try {
      const { homeId, deviceId } = req.params as RegisterParams;

      if (!deviceId || !homeId) {
        return;
      }

      const db = fastify.mongo.client.db(config.dbName);
      const homeTokens = await db.collection('tokens').find(
        { homeId: new ObjectId(homeId) },
        { projection: { '_id': 0, value: 1} }
      ).toArray();
      
      clientsHandler.onCamRegister(
        socket, deviceId, homeId, homeTokens.map(hm => hm.value)
      );
      fastify.log.info(`Cam client connected: ${deviceId} / home: ${homeId}`); 

      const waitForAuth = setTimeout(() => { 
        clientsHandler.forceCloseCamWs(deviceId);
      }, 5000);

      socket.on('message', (event: string) => {
        try {
          const parsedEvent = JSON.parse(event);
          fastify.log.info(`Server receivied event: ${parsedEvent.action} from ${deviceId}`);
          if (!clientsHandler.authenticateCamWs(deviceId, parsedEvent.staticToken)) { 
            return;
          }

          if (parsedEvent.action === WS_MESSAGES.REGISTER_AUTH) {
            clearTimeout(waitForAuth);
            socket.send(JSON.stringify({
              action: WS_MESSAGES.REGISTER_CONFIRM
            }));
          }
          if (parsedEvent.action === WS_MESSAGES.STREAM_DATA) {
            clientsHandler.streamDataReceiveid(deviceId, parsedEvent.data);
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

  fastify.get('/api/monitoring/register-webclient/:homeId/:clientId/:deviceId', { 
      websocket: true,
    }, async (socket, req) => {
    try {
      const { clientId, deviceId, homeId } = req.params as RegisterParams;
      let token = null;
      let userId = null;

      if (req.headers.cookie) {
        const cookies = fastify.parseCookie(req.headers.cookie);
        token = JSON.parse(cookies.auth)?.token;
        userId = JSON.parse(cookies.auth)?.userId;
      }
      
      if (!clientId || !deviceId || !homeId || !fastify.jwt.verify(token)) {
        return;
      }

      const db = fastify.mongo.client.db(config.dbName);
      const userHomes = await db.collection('homes').find({
        userId: new ObjectId(userId)
      }).toArray();

      const userIsOwner = userHomes.find((home) => home._id.toString() === homeId)
      if (!userIsOwner) {
        return;
      }

      clientsHandler.onWebClientRegister(socket, clientId, token);
      fastify.log.info(`Cam client connected: ${clientId}, for feed from ${deviceId}`);

      const waitForAuth = setTimeout(() => { 
        clientsHandler.forceCloseWebWs(clientId);
      }, 5000);
      
      socket.on('message', (event: string) => {
        try {
          const parsedEvent = JSON.parse(event);
          fastify.log.info(`Server receivied event: ${parsedEvent.action} from ${clientId}`);
          
          if (
            !clientsHandler.authenticateWebWs(clientId, parsedEvent.token) ||
            !fastify.jwt.verify(parsedEvent.token)
          ) { return }

          if (parsedEvent.action === WS_MESSAGES.REGISTER_AUTH) {
            clearTimeout(waitForAuth);
            socket.send(JSON.stringify({
              action: WS_MESSAGES.REGISTER_CONFIRM
            }));
          }
          if (parsedEvent.action === WS_MESSAGES.STREAM_PLAY) {
            clientsHandler.streamPlay(deviceId);
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
              clientsHandler.streamStop(connection.deviceId);
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

  fastify.get('/api/monitoring/cams', {
    onRequest: [fastify.authenticate]
  }, async (_request, reply) => {
    try {
      const camsList = clientsHandler.camConnections.map(cam => {
        return {
          name: cam.deviceId,
          active: cam.active
        }
      });
      return reply.send(camsList);
    } catch (error) {
      fastify.log.error(error);
    }
  })

  clientsHandler.initIntervals();
}

export {routes as monitoringRoutes};