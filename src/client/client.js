import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'node:path';

import { config } from './config.js';
import { CamHandler } from './CamHandler.js';
import { mainRoutes } from './routes/main.js'; 
import { monitoringRoutes } from './routes/monitoring.js'; 

const fastify = Fastify({
  logger: {
    level: config.nodeEnv === 'prod' ? 'error' : 'info'
  }
})

const camHandler = new CamHandler({
  config,
});

fastify.register(websocket);
fastify.register(fastifyStatic, {
  root: path.join(import.meta.dirname, 'public')
});
fastify.register(mainRoutes, {
  config
});
fastify.register(monitoringRoutes, {
  config,
  camHandler
});

export const client = async () => {
  fastify.listen({ port: config.clientPort }, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    camHandler.setLogger(fastify.log);
    camHandler.init();
  })
}