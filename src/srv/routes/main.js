'use strict'

async function routes (fastify, options) {
    fastify.get('/', async (request, reply) => {
        return reply.send('nothing to see here');
    })
    fastify.get('/monitor', async (request, reply) => {
        return reply.sendFile('monitor.html');
    })
}

export {routes as mainRoutes};