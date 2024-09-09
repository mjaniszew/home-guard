async function routes (fastify, options) {
  const { camHandler,  config } = options;

  fastify.get('/api/monitoring/list', (req, reply) => {
    const devices = camHandler.getCamDevices();
    return reply.send({ devices });
  })

  fastify.post('/api/monitoring/select-device/:deviceId', (req, reply) => {
    const { deviceId } = req.params;
    camHandler.selectCamDevice();
    return reply.send({ status: 'ok' });
  })
}

export {routes as monitoringRoutes};