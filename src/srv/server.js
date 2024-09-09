import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import path from 'node:path';

import dbConnector from './dbConnector.js'
// import { camStreamingHandler } from './camStreamingHandler.js';
import { mainRoutes } from './routes/main.js'; 
import { monitoringRoutes } from './routes/monitoring.js'; 

const fastify = Fastify({
  logger: true
})

// fastify.register(dbConnector);
// fastify.register(camStreamingHandler);
fastify.register(fastifyWebsocket);
fastify.register(fastifyStatic, {
  root: path.join(import.meta.dirname, 'public')
});
fastify.register(mainRoutes);
fastify.register(monitoringRoutes);

export const app = async () => {
  fastify.listen({ port: 3000 }, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  })
}