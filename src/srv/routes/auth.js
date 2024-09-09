async function routes (fastify, options) {
  const { config } = options;

  fastify.post('/api/auth/token', async (req, res) => {
    try {
      const { user, password } = req.body;
      if (!user || !password) {
          return res.status(400).send({
            error: "Manadatory params are missing"
          });
      }
      if (user !== config.authUser || password !== config.authPwd) {
        return res.status(401).send({
          error: "Incorrect credentials"
        });
      }
      const token = fastify.jwt.sign({user, password}, {expiresIn: 86400});
      res.status(200).send({token})
    } catch (error) {
        fastify.log.error(error);
    }
})
}

export {routes as authRoutes};