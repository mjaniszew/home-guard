const connect = () => {
  const clientId = `web-${Math.floor(Math.random() * 10000)}`;
  let webSocketConnection;
  let streamCanvas;
  let streamCtx;
  let streamImg;
  let config;

  const getToken = () => {
    let token;
    document.cookie.split(';').forEach(cookie => {
      const part = cookie.trim().split('=');
      if (part[0] === 'token') {
        token = part[1];
      }
    });
    return token;
  };

  const sendPlayAction = () => {
    webSocketConnection.send(JSON.stringify({
      action: 'STREAM_PLAY'
    }));
  }

  fetch('/api/web-config', {
    headers: {Authorization: `Bearer ${getToken()}`}
  })
  .then(response => response.json())
  .then(response => {
    config = response;
    webSocketConnection = new WebSocket(
      `${config.connectionSecure? 'wss' : 'ws'}://${config.serverHost}/api/monitoring/register-webclient/${clientId}`,
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

connect();