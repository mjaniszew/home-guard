import { 
  FastifyInstance,
  RouteShorthandOptions,
} from 'fastify';

import { ConfigType } from '../config.js';

type RouteOptions = RouteShorthandOptions & {
  config: ConfigType
};

enum SENSOR_TYPES {
  READING = "READING",
  ALERT = "ALERT"
}

type SensorData = {
  sensorId: string,
  name: string,
  type: SENSOR_TYPES,
  value: string | number | boolean,
  homeId?: string,
  timestamp?: number
}

export const sensorsRoutes = async (fastify: FastifyInstance, options: RouteOptions) => {
  const { config } = options;

  fastify.get('/api/sensors/readings', {
    onRequest: [fastify.authenticate]
  }, async (_request, reply) => {
    try {
      const db = fastify.mongo.client.db(config.dbName);
      const sensordData = await db.collection('sensors').find().min({'timestamp': -1}).toArray();

      return reply.send(sensordData);
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.post('/api/sensors/reading', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const sensorData = request.body as SensorData;
      const db = fastify.mongo.client.db(config.dbName);

      if (sensorData?.sensorId) {
        const insertData = sensorData;
        insertData.timestamp = Date.now();
        insertData.homeId = 'melina';
        const res = db.collection('sensors').insertOne(sensorData);

        return reply.send({status: 'OK'});
      } else {
        return reply.status(400).send({
          error: "Incorrect sensor data"
        });
      }
    } catch (error) {
      fastify.log.error(error);
    }
  })
}