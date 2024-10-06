import { Server, IncomingMessage, ServerResponse } from "http";
import fastify, { 
  FastifyInstance,
  FastifyRequest,
  FastifyReply
} from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from "@fastify/cookie";
import fastifyFormbody from '@fastify/formbody';
import fastifyCors from '@fastify/cors';
import path from 'node:path';

import { config } from './config.js';
import { mainRoutes } from './routes/main.js'; 
import { authRoutes, AuthCredentialsBody } from './routes/auth.js'; 
import { monitoringRoutes } from './routes/monitoring.js'; 
import { ClientsHandler } from './ClientsHandler.js';

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: any
  }
}

const server: FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({
  logger: {
    level: config.nodeEnv === 'prod' ? 'error' : 'info'
  }
});

const clientsHandler = new ClientsHandler({
  config,
});

server.register(fastifyCors, {
  origin: [config.serverCorsOrigin],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});
server.register(fastifyJwt, {
  secret: config.authSecret
});
server.register(fastifyCookie, {});
server.decorate("authenticate", async function(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})

server.register(fastifyWebsocket);
server.register(fastifyFormbody);
server.register(fastifyStatic, {
  root: path.join(import.meta.dirname, 'public')
});
server.register(mainRoutes, {
  config
});
server.register(authRoutes, {
  config
});
server.register(monitoringRoutes, {
  config,
  clientsHandler
});

const err = (err: Error | null, _address: string) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }
};

export const srv = async () => {
  // @ts-ignore
  if (typeof (PhusionPassenger as Object) !== 'undefined') {
    server.listen({ 
      path: 'passenger',
      host: '127.0.0.1'
    }, err)
  } else {
    server.listen({ 
      port: config.serverPort
    }, err)
  }
  clientsHandler.setLogger(server.log);
}