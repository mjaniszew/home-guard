import { 
  FastifyInstance,
  RouteShorthandOptions,
} from 'fastify';

import { ConfigType } from '../config.js';

type RouteOptions = RouteShorthandOptions & {
  config: ConfigType
};

async function routes (fastify: FastifyInstance, options: RouteOptions) {
  const { config } = options;

  fastify.get('/', async (_request, reply) => {
    return reply.send('nothing to see here');
  })
  fastify.get('/monitor', async (request, reply) => {
    try {
      const { username, token } = request.session.get('data') || {};
      if (username && token) {
        return reply
          .setCookie('token', token, {
            domain: config.serverDomain,
            path: '/',
            secure: false,
            httpOnly: false,
            maxAge: 24 * 60 * 60,
          })
          .sendFile('monitor.html');
      } else {
        return reply.sendFile('login.html');
      }
    } catch (error) {
      fastify.log.error(error);
    }
  })
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