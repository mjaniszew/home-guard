import { 
  FastifyInstance,
  RouteShorthandOptions,
} from 'fastify';
import bcrypt from 'bcryptjs'; 

import { ConfigType } from '../config.js';

type RouteOptions = RouteShorthandOptions & {
  config: ConfigType
};

export type AuthCredentialsBody = {
  username?: string,
  password?: string
}

export type UserDbObject = {
  _id: string,
  username: string,
  password: string,
  homeId: string
}

export const authRoutes = async (fastify: FastifyInstance, options: RouteOptions) => {
  const { config } = options;

  fastify.post('/api/auth/web', async (request, reply) => {
    try {
      const { username, password } = request.body as AuthCredentialsBody;
      const db = fastify.mongo.client.db(config.dbName);

      if (!username || !password) {
          return reply.status(400).send({
            error: "Manadatory params are missing"
          });
      }

      const user = await db.collection('users').findOne({username}) as UserDbObject | null ;
      
      if (!user || await bcrypt.compare(password, user.password) !== true) {
        return reply.status(401).send({
          error: "Incorrect credentials"
        });
      }
      
      const token = fastify.jwt.sign({username, userId: user._id}, {expiresIn: 24 * 60 * 60});
      reply.send({
        username,
        userId: user._id,
        token
      });
    } catch (error) {
      fastify.log.error(error);
    }
  })
}