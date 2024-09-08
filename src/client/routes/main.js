'use strict'

async function routes (fastify, options) {
    fastify.get('/', async (request, reply) => {
        return reply.sendFile('index.html');
    })
}

export {routes as mainRoutes};