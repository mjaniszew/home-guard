async function routes (fastify, options) {
  const { config } = options;

  fastify.post('/api/auth/web', (request, reply) => {
    try {
      const { username, password } = request.body;
      if (!username || !password) {
          return reply.status(400).send({
            error: "Manadatory params are missing"
          });
      }
      if (username !== config.authUser || password !== config.authPwd) {
        return reply.status(401).send({
          error: "Incorrect credentials"
        });
      }
      const token = fastify.jwt.sign({username, password}, {expiresIn: 24 * 60 * 60});
      request.session.set('data', {
        username,
        token
      });
      reply.redirect("/monitor");
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.post('/api/auth/client', (request, reply) => {
    try {
      const { username, password } = request.body;
      if (!username || !password) {
          return reply.status(400).send({
            error: "Manadatory params are missing"
          });
      }
      if (username !== config.authUser || password !== config.authPwd) {
        return reply.status(401).send({
          error: "Incorrect credentials"
        });
      }
      return reply.status(200).send({
        token
      });
    } catch (error) {
      fastify.log.error(error);
    }
  })
}

export {routes as authRoutes};