async function routes (fastify, options) {
  const config = options.config;

  fastify.get('/', async (request, reply) => {
    return reply.send('nothing to see here');
  })
  fastify.get('/monitor', async (request, reply) => {
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
  })
  fastify.get('/api/web-config', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
    return reply.send({
      serverHost: config.serverHost,
      connectionSecure: config.connectionSecure
    });
  })
}

export {routes as mainRoutes};