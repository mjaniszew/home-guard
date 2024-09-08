import NodeWebcam from 'node-webcam';

import WebSocket from 'ws';

async function routes (fastify, options) {
  fastify.get('/api/monitoring/connect-ws', (request, reply) => {
    const webSocketConnection = new WebSocket('ws://localhost:3000/api/monitoring/register-ws', {
      perMessageDeflate: false
    });

    webSocketConnection.on('error', console.error);

    webSocketConnection.on('open', function open() {
      webSocketConnection.send({
        type: 'REGISTER',
        clientId: 'cam01'
      });
    });

    webSocketConnection.on('message', function message(data) {
      // reply.send({status: 'connected'});
    });
  })

  fastify.get('/api/monitoring/list', (request, reply) => {
    const list = NodeWebcam.list(( list ) => {
      return reply.send({ list });
    });
  })

  fastify.get('/api/monitoring/still/:deviceId', (request, reply) => {
    const { deviceId } = request.params;
    fastify.log.info(`device id ${deviceId}`);

    const Webcam = NodeWebcam.create({
      width: 1280,
      height: 720,
      quality: 95,
      frames: 1,
      saveShots: true,
      output: "jpeg",
      device: `${deviceId}`,
      callbackReturn: "base64",
      verbose: false
    });

    Webcam.capture("frame", function ( err, data ) {
      reply.send({
        frame: data
      });
    });
  })
}

export {routes as monitoringRoutes};