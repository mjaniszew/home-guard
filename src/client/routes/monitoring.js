async function routes (fastify, options) {
  const { camHandler,  config } = options;

  fastify.get('/api/monitoring/list', (req, reply) => {
    try {
      const devices = camHandler.getCamDevices();
      return reply.send({ devices });
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.post('/api/monitoring/select-device/:deviceId', (req, reply) => {
    try {
      const { deviceId } = req.params;
      camHandler.selectCamDevice(deviceId);
      return reply.send({ status: 'ok' });
    } catch (error) {
      fastify.log.error(error);
    }
  })
}

export {routes as monitoringRoutes};