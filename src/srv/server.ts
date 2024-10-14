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
import fastifyMongodb from '@fastify/mongodb';
import path from 'node:path';

import { config } from './config.js';
import { mainRoutes } from './routes/main.js'; 
import { authRoutes } from './routes/auth.js'; 
import { sensorsRoutes } from './routes/sensors.js';
import { homesRoutes } from "./routes/homes.js";
import { monitoringRoutes } from './routes/monitoring.js'; 
import { ClientsHandler } from './ClientsHandler.js';
import fastifyPlugin from "fastify-plugin";

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: any,
    checkHomePermissions: any
  }
}

declare module "@fastify/jwt" {
  export interface FastifyJWT {
    payload: { 
      userId: string,
      username: string
    },
    user: {
      userId: string,
      username: string
    }
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
  secret: config.authSecret,
  sign: {
    algorithm: 'HS256'
  },
});
server.register(fastifyCookie, {});

async function permissionsDecorator (server: FastifyInstance) {

  server.decorate("authenticate", async function(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })

  server.decorate("checkHomePermissions", async function(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { homeId } = request.params as { homeId?: string } || request.body as { homeId?: string };
  
      if (!homeId) {
        return reply.status(401).send({error: "Insufficient permissions"});
      }
    } catch (err) {
      reply.send(err)
    }
  })
}

server.register(fastifyMongodb, { 
  url: config.dbConnectionUrl
})

server.register(fastifyPlugin(permissionsDecorator));
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
server.register(sensorsRoutes, {
  config
});
server.register(homesRoutes, {
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