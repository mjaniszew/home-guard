import fastifyPlugin from 'fastify-plugin'
import fastifyMongo from '@fastify/mongodb'

/**
 * @param {FastifyInstance} fastify
 * @param {Object} options
 */
async function dbConnector (fastify, options) {
  fastify.register(fastifyMongo, {
    url: 'mongodb://admin:test@localhost:27017/testdb?authSource=admin',
    forceClose : true,
  })
}

export default fastifyPlugin(dbConnector)