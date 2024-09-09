import NodeWebcam from 'node-webcam';

import WebSocket from 'ws';

async function routes (fastify, options) {
  const camHandler = options.camHandler;

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