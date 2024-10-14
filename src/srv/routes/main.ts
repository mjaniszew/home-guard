import { 
  FastifyInstance,
  RouteShorthandOptions,
  FastifyRequest,
  FastifyReply
} from 'fastify';

import { ConfigType } from '../config.js';

type RouteOptions = RouteShorthandOptions & {
  config: ConfigType
};

async function routes (fastify: FastifyInstance, options: RouteOptions) {
  const { config } = options;

  const handleWebRoutes = async (_request: FastifyRequest, reply: FastifyReply) => {
    if (config.nodeEnv === 'dev') {
      return reply.redirect(config.serverCorsOrigin);
    } else {
      return reply.sendFile('index.html');
    }
  }

  fastify.get('/', handleWebRoutes);
  fastify.setNotFoundHandler(handleWebRoutes);

  fastify.get('/api/web-config', {
    onRequest: [fastify.authenticate]
  }, async (_request, reply) => {
    try {
      return reply.send({
        serverHost: config.serverHost,
        connectionSecure: config.connectionSecure
      });
    } catch (error) {
      fastify.log.error(error);
    }
  })
}

export {routes as mainRoutes};