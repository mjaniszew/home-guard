import fetch from 'node-fetch';
import { 
  FastifyInstance,
  RouteShorthandOptions,
} from 'fastify';
import { ObjectId } from '@fastify/mongodb';
import { WithId } from 'mongodb';

import { ConfigType } from '../config.js';

type RouteOptions = RouteShorthandOptions & {
  config: ConfigType
};

export enum SENSOR_TYPES {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  MOTION = 'MOTION',
  FLOOD = 'FLOOD',
  OTHER_NUMERICAL_MEASURE = 'OTHER_NUMERICAL_MEASURE',
  OTHER_TEXT_MEASURE = 'OTHER_TEXTL_MEASURE'
};

type SensorData = {
  name: string,
  homeId: string,
  type: SENSOR_TYPES,
};

type SensorEditData = Omit<SensorData, 'homeId'>;

type TokenData = {
  name: string,
  homeId: string,
  value: string
};

type SensorReadingData = {
  sensorId: string,
  value: string | number,
};

type SensorsQueryString = {
  homeId: string
};

type SensorRequestParams = {
  sensorId: string
};

type SensorQueryParams = {
  limit?: number
};

export const sensorsRoutes = async (fastify: FastifyInstance, options: RouteOptions) => {
  const { config } = options;

  fastify.get('/api/sensors', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const { homeId } = await request.query as SensorsQueryString;

      const db = fastify.mongo.client.db(config.dbName);

      const userHomes = await db.collection('homes').find({
        userId: new ObjectId(userId)
      }).toArray();
      const userIsOwnerOfHome = userHomes.find((home) => home._id.toString() === homeId)

      if (!userIsOwnerOfHome) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const sensorsData = await db.collection('sensors').find({
        homeId: new ObjectId(homeId)
      }).toArray();

      return reply.send(sensorsData);
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.post('/api/sensors', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const { name, type, homeId} = request.body as SensorData;
      const db = fastify.mongo.client.db(config.dbName);

      const userHomes = await db.collection('homes').find({
        userId: new ObjectId(userId)
      }).toArray();
      const userIsOwnerOfHome = userHomes.find((home) => home._id.toString() === homeId)

      if (!userIsOwnerOfHome) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      if (name && type) {
        const res = db.collection('sensors').insertOne({
          name,
          type,
          homeId: new ObjectId(homeId)
        });

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

  fastify.get('/api/sensors/readings', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const { homeId } = await request.query as SensorsQueryString;

      const db = fastify.mongo.client.db(config.dbName);

      const userHomes = await db.collection('homes').find({
        userId: new ObjectId(userId)
      }).toArray();
      const userIsOwnerOfHome = userHomes.find((home) => home._id.toString() === homeId)

      if (!userIsOwnerOfHome) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const sensorsData = await db.collection('sensors_readings').find({
        homeId: new ObjectId(homeId)
      }).toArray();

      return reply.send(sensorsData);
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.get('/api/sensors/readings/current', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const { homeId } = await request.query as SensorsQueryString;

      const db = fastify.mongo.client.db(config.dbName);

      const userHomes = await db.collection('homes').find({
        userId: new ObjectId(userId)
      }).toArray();
      const userIsOwnerOfHome = userHomes.find((home) => home._id.toString() === homeId)

      if (!userIsOwnerOfHome) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const sensorsData = await db.collection('sensors_with_reading').find({
        homeId: new ObjectId(homeId)
      }).toArray();

      return reply.send(sensorsData);
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.post('/api/sensors/readings', {}, async (request, reply) => {
    try {
      const token = request.headers['static_auth'];
      const { sensorId, value } = request.body as SensorReadingData;

      if (!token) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const db = fastify.mongo.client.db(config.dbName);

      const tokenData = await db.collection('tokens').findOne({
        value: token
      }) as WithId<SensorData>;

      const sensorDetails = await db.collection('sensors').findOne({
        _id: new ObjectId(sensorId)
      }) as WithId<TokenData>;

      const userIsOwnerOfHome = tokenData?.homeId.toString() === sensorDetails?.homeId.toString();

      if (!tokenData?.homeId || !userIsOwnerOfHome) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      if (sensorId && value) {
        db.collection('sensors_readings').insertOne({
          sensorId: new ObjectId(sensorId),
          homeId: new ObjectId(sensorDetails.homeId),
          value,
          timestamp: Date.now()
        });

        const homeDetails = await db.collection('homes').findOne({
          _id: new ObjectId(sensorDetails.homeId)
        });

        if (value === 'ALERT' && homeDetails?.notificationTopic) {
          await fetch(
            `https://ntfy.sh/${homeDetails.notificationTopic}`, {
              method: 'POST',
              body: `${sensorDetails.name}: ${value}!!!`
            }
          );
        }

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

  fastify.get('/api/sensors/:sensorId', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const { sensorId } = await request.params as SensorRequestParams;

      const db = fastify.mongo.client.db(config.dbName);

      const userHomes = await db.collection('homes').find({
        userId: new ObjectId(userId)
      }).toArray();

      const sensorData = await db.collection('sensors').findOne({
        _id: new ObjectId(sensorId)
      }) as WithId<SensorData>;

      const userIsOwnerOfSensor = userHomes.find(
        (home) => home._id.toString() === sensorData.homeId.toString()
      )

      if (!userIsOwnerOfSensor) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      return reply.send(sensorData);
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.post('/api/sensors/:sensorId/edit', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
        const { userId } = request.user;
        const { sensorId } = await request.params as SensorRequestParams;
        const { name, type } = request.body as SensorEditData;

        const db = fastify.mongo.client.db(config.dbName);

        const userHomes = await db.collection('homes').find({
          userId: new ObjectId(userId)
        }).toArray();
  
        const sensorData = await db.collection('sensors').findOne({
          _id: new ObjectId(sensorId)
        }) as WithId<SensorData>;
  
        const userIsOwnerOfSensor = userHomes.find(
          (home) => home._id.toString() === sensorData.homeId.toString()
        )

        if (!userIsOwnerOfSensor) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const updateFields = {} as Record<string, string>;

        if (name) {
          updateFields['name'] = name;
        }
  
        if (type) {
          updateFields['type'] = type;
        }
  
        await db.collection('sensors').findOneAndUpdate(
          { '_id': new ObjectId(sensorId) }, 
          { $set: updateFields }
        );

        return reply.send({ status: 'DELETED' });
    }
    catch (error) {
        fastify.log.error(error);
    }
  });

  fastify.delete('/api/sensors/:sensorId', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
        const { userId } = request.user;
        const { sensorId } = await request.params as SensorRequestParams;

        const db = fastify.mongo.client.db(config.dbName);

        const userHomes = await db.collection('homes').find({
          userId: new ObjectId(userId)
        }).toArray();
  
        const sensorData = await db.collection('sensors').findOne({
          _id: new ObjectId(sensorId)
        }) as WithId<SensorData>;
  
        const userIsOwnerOfSensor = userHomes.find(
          (home) => home._id.toString() === sensorData.homeId.toString()
        )

        if (!userIsOwnerOfSensor) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        await db.collection('sensors_readings').deleteMany({
          sensorId: new ObjectId(sensorId)
        });

        await db.collection('sensors').deleteOne({
          _id: new ObjectId(sensorId)
        });

        return reply.send({ status: 'DELETED' });
    }
    catch (error) {
        fastify.log.error(error);
    }
  });

  fastify.get('/api/sensors/:sensorId/readings', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const { sensorId } = await request.params as SensorRequestParams;
      const { limit } = await request.query as SensorQueryParams;

      const db = fastify.mongo.client.db(config.dbName);

      const userHomes = await db.collection('homes').find({
        userId: new ObjectId(userId)
      }).toArray();

      const sensorData = await db.collection('sensors').findOne({
        _id: new ObjectId(sensorId)
      }) as WithId<SensorData>;

      const userIsOwnerOfSensor = userHomes.find(
        (home) => home._id.toString() === sensorData.homeId.toString()
      )

      if (!userIsOwnerOfSensor) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      
      const sensorReadings = await db.collection('sensors_readings').find({
        sensorId: new ObjectId(sensorId)
      }).sort({ timestamp: -1 }).limit(Number(limit) || 100).toArray();

      return reply.send(sensorReadings);
    } catch (error) {
      fastify.log.error(error);
    }
  })

}