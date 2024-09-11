async function routes (fastify, options) {
  const config = options.config;

  fastify.get('/', async (request, reply) => {
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
  }, async (request, reply) => {
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