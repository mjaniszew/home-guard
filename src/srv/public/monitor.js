const clientId = `web-${Math.floor(Math.random() * 10000)}`;
let webSocketConnection;
let streamCanvas;
let streamCtx;
let streamImg;
let config;

const connect = () => {
  const configResponse = fetch('/api/web-config')
    .then(response => response.json())
    .then(response => {
      config = response;
      webSocketConnection = new WebSocket(
        `ws://${config.serverHost}:${config.serverPort}/api/monitoring/register-webclient/${clientId}`,
      );
      webSocketConnection.onopen = (event) => {
        // streamCanvas = document.getElementById("camStream");
        // streamCtx = streamCanvas.getContext("2d");
        // streamImg = new Image(1280, 720);
        // streamImg.onload = function() {
        //   streamCtx.drawImage(streamImg, 0, 0);
        // };
        streamImg = document.getElementById("camStream");
      };
    
      webSocketConnection.onmessage = (event) => {
        const parsedEvent = JSON.parse(event.data);
        if (parsedEvent.action === "REGISTER_CONFIRM") {
          sendPlayAction();
        }
        if (parsedEvent.action === "STREAM_DATA") {
          streamImg.src = parsedEvent.data;
        }
      };
    });
}

const sendPlayAction = () => {
  webSocketConnection.send(JSON.stringify({
    action: 'STREAM_PLAY'
  }));
}

connect();