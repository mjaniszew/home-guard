import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'node:path';

import { mainRoutes } from './routes/main.js'; 
import { monitoringRoutes } from './routes/monitoring.js'; 

const fastify = Fastify({
  logger: true
})

fastify.register(websocket);
fastify.register(fastifyStatic, {
  root: path.join(import.meta.dirname, 'public')
});
fastify.register(mainRoutes);
fastify.register(monitoringRoutes);

export const client = async () => {
  fastify.listen({ port: 3001 }, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  })
}