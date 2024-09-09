import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'node:path';

import { CamHandler } from './CamHandler.js';
import { mainRoutes } from './routes/main.js'; 
import { monitoringRoutes } from './routes/monitoring.js'; 

const clientId = 'cam-01';

const fastify = Fastify({
  logger: true
})

const camHandler = new CamHandler({
  logger: fastify.logger,
  clientId: clientId,
  deviceId: 1,
  registerUrl: `ws://localhost:3000/api/monitoring/register-cam/${clientId}`
});

fastify.register(websocket);
fastify.register(fastifyStatic, {
  root: path.join(import.meta.dirname, 'public')
});
fastify.register(mainRoutes);
fastify.register(monitoringRoutes, {
  camHandler
});

export const client = async () => {
  fastify.listen({ port: 3001 }, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
    camHandler.setLogger(fastify.log);
    camHandler.init();
  })
}