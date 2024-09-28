import { 
  FastifyInstance,
  RouteShorthandOptions,
  FastifyRequest,
  FastifyReply
} from 'fastify';

async function routes (fastify: FastifyInstance, _options: RouteShorthandOptions) {
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.sendFile('index.html');
  })
}

export {routes as mainRoutes};