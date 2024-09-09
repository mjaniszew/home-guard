async function routes (fastify, options) {
  const config = options.config;

  fastify.get('/', async (request, reply) => {
    return reply.send('nothing to see here');
  })
  fastify.get('/monitor', async (request, reply) => {
    return reply.sendFile('monitor.html');
  })
  fastify.get('/api/web-config', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
    return reply.send({
      serverHost: config.serverHost,
      serverPort: config.serverPort
    });
  })
}

export {routes as mainRoutes};