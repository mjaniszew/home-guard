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
  userId: string,
  homeId: string,
  tokenId: string
}

type HomeToken = {
  _id: string,
  value: string,
  name: string,
  homeId: string
}

type HomeTokenCreateBody = Omit<HomeToken, '_id' | 'homeId'>;

type UserHomeDbResponse = {
  _id: string,
  name: string,
  userId: string
  tokens: HomeToken[]
}

export const homesRoutes = async (fastify: FastifyInstance, options: RouteOptions) => {
  const { config } = options;

  fastify.get('/api/homes', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const db = fastify.mongo.client.db(config.dbName);
      const homesData = await db.collection('homesWithTokens').find({
        userId: new ObjectId(userId)
      }).toArray();

      return reply.send(homesData);
    } catch (error) {
      fastify.log.error(error);
    }
  })

  fastify.post('/api/homes/:homeId/token', {
    onRequest: [fastify.authenticate, fastify.checkHomePermissions]
  }, async (request, reply) => {
    try {
      const { homeId } = request.params as UserHomeTokenCreateParams;
      const { name, value } = request.body as HomeTokenCreateBody;

      const db = fastify.mongo.client.db(config.dbName);

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
    onRequest: [fastify.authenticate, fastify.checkHomePermissions]
  }, async (request, reply) => {
    try {
      const { homeId, tokenId } = request.params as UserHomeTokenDeleteParams;

      const db = fastify.mongo.client.db(config.dbName);

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