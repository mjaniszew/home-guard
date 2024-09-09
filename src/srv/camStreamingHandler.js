import fastifyPlugin from 'fastify-plugin'

/**
 * @param {FastifyInstance} fastify
 * @param {Object} options
 */
async function streamingFactory (fastify, options) {

  const streamData = [];
  const webConnections = [];
  const camConnections = [];
  
  const onCamRegister = (socket, message) => {
    camConnections.push({
      clientId: message.clientId,
      socket: socket
    });
    socket.send({
      type: 'ACTION',
      action: 'PENDING'
    });
  }
  
  const onWebClientRegister = (socket, message) => {
    webConnections.push({
      clientId: message.clientId,
      socket: socket
    });
  }
  
  const streamDataReceiveid = () => {
    streamData.push({
      time: message.time,
      data: message.data
    });
  }

  return {
    'REGISTER': onWebClientRegister,

  }
}

const camStreamingHandler = fastifyPlugin(streamingFactory)

export { camStreamingHandler };