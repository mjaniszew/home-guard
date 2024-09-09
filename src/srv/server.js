import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import fastifyJwt from '@fastify/jwt';
import path from 'node:path';

// import dbConnector from './dbConnector.js'
import { config } from './config.js';
import { mainRoutes } from './routes/main.js'; 
import { authRoutes } from './routes/auth.js'; 
import { monitoringRoutes } from './routes/monitoring.js'; 

const fastify = Fastify({
  logger: {
    level: config.nodeEnv === 'prod' ? 'error' : 'info'
  }
})

// fastify.register(dbConnector);
fastify.register(fastifyJwt, {
  secret: config.authSecret
});
fastify.decorate("authenticate", async function(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})

fastify.register(fastifyWebsocket);
fastify.register(fastifyStatic, {
  root: path.join(import.meta.dirname, 'public')
});
fastify.register(mainRoutes, {
  config
});
fastify.register(authRoutes, {
  config
});
fastify.register(monitoringRoutes, {
  config
});

export const app = async () => {
  fastify.listen({ port: config.serverPort }, function (err, address) {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  })
}