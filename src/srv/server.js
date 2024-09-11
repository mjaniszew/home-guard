import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import fastifyJwt from '@fastify/jwt';
import fastifySecureSession from '@fastify/secure-session';
import fastifyFormbody from '@fastify/formbody';
import path from 'node:path';

import { config } from './config.js';
import { mainRoutes } from './routes/main.js'; 
import { authRoutes } from './routes/auth.js'; 
import { monitoringRoutes } from './routes/monitoring.js'; 

const fastify = Fastify({
  logger: {
    level: config.nodeEnv === 'prod' ? 'error' : 'info'
  }
})

fastify.register(fastifyJwt, {
  secret: config.authSecret
});
fastify.register(fastifySecureSession, {
  sessionName: 'session',
  cookieName: 'session-cookie',
  key: Buffer.from(config.authSecret, "hex"),
  expiry: 24 * 60 * 60,
  cookie: {
    domain: config.serverDomain,
    path: '/',
  }
});
fastify.decorate("authenticate", async function(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})

fastify.register(fastifyWebsocket);
fastify.register(fastifyFormbody);
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

const err = (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
};

export const server = async () => {
  if (typeof (PhusionPassenger) !== 'undefined') {
    fastify.listen({ 
      path: 'passenger',
      host: '127.0.0.1'
    }, err)
  } else {
    fastify.listen({ 
      port: config.serverPort
    }, err)
  }
}