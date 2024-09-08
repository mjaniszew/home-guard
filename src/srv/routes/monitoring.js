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
  streamData.push(message.data);
}

async function routes (fastify, options) {
  fastify.get('/api/monitoring/register-cam', { websocket: true }, (socket, req) => {
    console.log('Cam connected');
    
    socket.on('message', message => {
      if (message.type === 'REGISTER') {
        onCamRegister(socket, message);
      }
    });
  })

  fastify.get('/api/monitoring/register-webclient', { websocket: true }, (socket, req) => {
    console.log('Web Client connected');
    
    socket.on('message', message => {
      if (message.type === 'REGISTER') {
        onWebClientRegister(socket, message);
      }
    });
  })
}

export {routes as monitoringRoutes};