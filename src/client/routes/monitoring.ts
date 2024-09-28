import { 
  FastifyInstance,
  RouteShorthandOptions,
  FastifyRequest,
  FastifyReply
} from 'fastify';

import { ConfigType } from '../config.js';

type RouteOptions = RouteShorthandOptions & {
  config: ConfigType,
  camHandler: any,
};

type DeviceParams = {
  deviceId?: string,
};

async function routes (fastify: FastifyInstance, options: RouteOptions) {
  const { camHandler,  config } = options;

  fastify.get('/api/monitoring/list', (_req: FastifyRequest, reply: FastifyReply) => {
    try {
      const devices = camHandler.getCamDevices();
      return reply.send({ devices });
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.post('/api/monitoring/select-device/:deviceId', (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const { deviceId } = req.params as DeviceParams;
      if (deviceId) {
        camHandler.selectCamDevice(deviceId);
      }
      return reply.send({ status: 'ok' });
    } catch (error) {
      fastify.log.error(error);
    }
  })
}

export {routes as monitoringRoutes};