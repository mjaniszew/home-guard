import { Server, IncomingMessage, ServerResponse } from "http";
import fastify, { 
  FastifyInstance,
  FastifyRequest,
  FastifyReply
} from 'fastify';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'node:path';

import { config } from './config.js';
import { CamHandler } from './CamHandler.js';
import { mainRoutes } from './routes/main.js'; 
import { monitoringRoutes } from './routes/monitoring.js'; 

const client: FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({
  logger: {
    level: config.nodeEnv === 'prod' ? 'error' : 'info'
  }
})

const camHandler = new CamHandler({
  config,
});

client.register(websocket);
client.register(fastifyStatic, {
  root: path.join(import.meta.dirname, 'public')
});
client.register(mainRoutes, {
  config
});
client.register(monitoringRoutes, {
  config,
  camHandler
});

export const camCli = async () => {
  client.listen({ port: config.clientPort }, (err, _address) => {
    if (err) {
      client.log.error(err)
      process.exit(1)
    }
    camHandler.setLogger(client.log);
    camHandler.init();
  })
}