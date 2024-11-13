import { 
  FastifyInstance,
  RouteShorthandOptions,
} from 'fastify';
import { ObjectId } from '@fastify/mongodb';

import { ConfigType } from '../config.js';

type RouteOptions = RouteShorthandOptions & {
  config: ConfigType
};

type UserHomesGetParams = {
  userId: string
}

type UserHomeTokenCreateParams = {
  userId: string,
  homeId: string
}

type UserHomeTokenDeleteParams = {
  homeId: string,
  tokenId: string
}

type UserHomeEditDeleteParams = {
  homeId: string
}

type UserHomeEditBody = {
  name?: string,
  notificationTopic?: string
}

type HomeToken = {
  _id: string,
  value: string,
  name: string,
  homeId: string
}

type HomeTokenCreateBody = Omit<HomeToken, '_id' | 'homeId'>;

type UserHomeType = {
  _id: string,
  name: string,
  userId: string,
  notificationTopic?: string,
  tokens: HomeToken[]
}

type UserHomeCreateBody = Omit<UserHomeType, '_id'>;

type HomesQueryString = { 
  tokenData: string | undefined 
}

export const homesRoutes = async (fastify: FastifyInstance, options: RouteOptions) => {
  const { config } = options;

  fastify.get('/api/homes', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const { tokenData } = await request.query as HomesQueryString;

      const db = fastify.mongo.client.db(config.dbName);
      const collection = db.collection(tokenData ? 'homes_with_tokens' : 'homes'); 
      const homesData = await collection.find({
        userId: new ObjectId(userId)
      }).toArray();

      return reply.send(homesData);
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.post('/api/homes', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user;
      const { name, notificationTopic } = request.body as UserHomeCreateBody;

      const db = fastify.mongo.client.db(config.dbName); 
      await db.collection('homes').insertOne({
        userId: new ObjectId(userId),
        tokens: [],
        notificationTopic: notificationTopic || null,
        name
      });

      return reply.send({ status: 'CREATED' });
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.post('/api/homes/:homeId/edit', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { homeId } = request.params as UserHomeEditDeleteParams;
      const { name, notificationTopic } = request.body as UserHomeEditBody;
      const { userId } = request.user;

      const db = fastify.mongo.client.db(config.dbName);

      const userHomes = await db.collection('homes').find({
        userId: new ObjectId(userId)
      }).toArray();
      const userIsOwnerOfHome = userHomes.find((home) => home._id.toString() === homeId)

      if (!userIsOwnerOfHome) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const updateFields = {} as Record<string, string>;

      if (name) {
        updateFields['name'] = name;
      }

      if (notificationTopic) {
        updateFields['notificationTopic'] = notificationTopic;
      }

      await db.collection('homes').findOneAndUpdate(
        { '_id': new ObjectId(homeId) }, 
        { $set: updateFields }
      );

      return reply.send({status: 'OK'});
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.delete('/api/homes/:homeId', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { homeId } = request.params as UserHomeEditDeleteParams;
      const { userId } = request.user;

      const db = fastify.mongo.client.db(config.dbName);

      const userHomes = await db.collection('homes').find({
        userId: new ObjectId(userId)
      }).toArray();
      const userIsOwnerOfHome = userHomes.find((home) => home._id.toString() === homeId)

      if (!userIsOwnerOfHome) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const homeSensors = await db.collection('sensors').find({
        homeId: new ObjectId(homeId)
      }).toArray();

      await db.collection('sensors_readings').deleteMany({
        sensorId: {$in: homeSensors.map(sensor => sensor._id)}
      });

      await db.collection('sensors').deleteMany({
        _id: {$in: homeSensors.map(sensor => sensor._id)}
      });

      await db.collection('tokens').deleteMany(
        { 'homeId': new ObjectId(homeId) }, 
      );

      await db.collection('homes').deleteOne(
        { '_id': new ObjectId(homeId) }, 
      );

      return reply.send({status: 'DELETED'});
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.post('/api/homes/:homeId/token', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { homeId } = request.params as UserHomeTokenCreateParams;
      const { name, value } = request.body as HomeTokenCreateBody;
      const { userId } = request.user;

      const db = fastify.mongo.client.db(config.dbName);

      const userHomes = await db.collection('homes').find({
        userId: new ObjectId(userId)
      }).toArray();
      const userIsOwnerOfHome = userHomes.find((home) => home._id.toString() === homeId)

      if (!userIsOwnerOfHome) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      await db.collection('tokens').insertOne({
        name,
        value,
        homeId: new ObjectId(homeId)
      });

      const currentHomeTokens = await db.collection('tokens').distinct(
        '_id', { homeId: new ObjectId(homeId) }
      );

      await db.collection('homes').findOneAndUpdate(
        { '_id': new ObjectId(homeId) }, 
        { $set: { tokens : currentHomeTokens } }
      );

      return reply.send({ status: 'CREATED' });
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.delete('/api/homes/:homeId/token/:tokenId', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { homeId, tokenId } = request.params as UserHomeTokenDeleteParams;
      const { userId } = request.user;

      const db = fastify.mongo.client.db(config.dbName);

      const userHomes = await db.collection('homes').find({
        userId: new ObjectId(userId)
      }).toArray();
      const userIsOwnerOfHome = userHomes.find((home) => home._id.toString() === homeId)

      if (!userIsOwnerOfHome) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const deletedData = await db.collection('tokens').deleteOne(
        { '_id': new ObjectId(tokenId) }, 
      );

      if (deletedData.deletedCount > 0) {
        const currentHomeTokens = await db.collection('tokens').distinct(
          '_id', { homeId: new ObjectId(homeId) }
        );
  
        await db.collection('homes').findOneAndUpdate(
          { '_id': new ObjectId(homeId) }, 
          { $set: { tokens : currentHomeTokens } }
        );
      }

      return reply.send({status: 'DELETED'});
    } catch (error) {
      fastify.log.error(error);
    }
  })
}