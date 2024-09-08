const clientId = 'c01';
const url = 'ws://localhost:3000/api/monitoring/register-ws'
let webSocketConnection;

const connect = () => {
  webSocketConnection = new WebSocket(url);
  webSocketConnection.onopen = (event) => {
    webSocketConnection.send({
      type: "register",
      id: clientId,
      date: Date.now(),
    });
  };

  webSocketConnection.onmessage = (event) => {
    console.log(event.data);
  };
}

const sendMessage = () => {
  const msg = {
    type: "message",
    text: "test",
    id: clientId,
    date: Date.now(),
  };

  webSocketConnection.send(msg);
}

connect();