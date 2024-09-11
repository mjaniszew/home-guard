import NodeWebcam from 'node-webcam';
import WebSocket from 'ws';

const CamHandler = class {
  wsConnection;
  clientId;
  deviceId;
  devices;
  registerUrl;
  logger;
  config;
  framesReader;
  streamState;
  
  constructor(options) {
    this.config = options.config;
    this.clientId = this.config.clientId;
    this.deviceId = this.config.defaultDeviceId;
    this.registerUrl = `${this.config.connectionSecure ? 'wss' : 'ws'}://${this.config.serverHost}/api/monitoring/register-cam/${this.clientId}`;
    this.streamState = "STOP";
  }

  setLogger = (logger) => {
    this.logger = logger;
  }

  getCamDevices = () => {
    return this.devices;
  }

  selectCamDevice = (deviceId) => {
    this.deviceId = deviceId;
  }

  getCamFrame = async () => {
    const Webcam = NodeWebcam.create({
      width: 1280,
      height: 720,
      quality: 95,
      frames: 1,
      saveShots: false,
      output: "jpeg",
      device: `${this.deviceId}`,
      callbackReturn: "base64",
      verbose: false
    });

    Webcam.capture(`/tmp/frame-${this.clientId}`, ( err, data ) => {
      if (err) {
        return this.logger.error(err);
      }
      this.wsConnection.send(JSON.stringify({
        action: 'STREAM_DATA',
        staticToken: this.config.authStaticToken,
        data
      }));
    });
  }

  onConnectionOpen = () => {
    this.logger.info(`Connection established`);
  }

  onConnectionClose = () => {
    this.logger.info(`Connection terminated, trying to reconnect in 10 secs...`);
    setTimeout(this.connect, 10000);
  }

  onMessage = async (event) => {
    const parsedEvent = JSON.parse(event);
    this.logger.info(`Cam client ${this.clientId} receivied event: ${parsedEvent.action}`);
    if (parsedEvent.action === 'REGISTER_AUTH') {
      this.wsConnection.send(JSON.stringify({
        action: 'REGISTER_AUTH',
        staticToken: this.config.authStaticToken
      }));
    }
    if (parsedEvent.action === 'STREAM_PLAY') {
      this.streamState = 'PLAY';
      this.framesReader = setInterval(() => {
        if (this.streamState === 'PLAY') {
          this.getCamFrame();
        }
      }, this.config.streamSendInterval);
    }
    if (parsedEvent.action === 'STREAM_STOP') {
      this.streamState = 'STOP';
      clearInterval(this.framesReader);
    }
  }

  onError = (error) => {
    this.logger.error(error);
  }

  connect = () => {
    this.wsConnection = new WebSocket(this.registerUrl, {
      perMessageDeflate: false
    });

    this.wsConnection.on('error', this.onError);
    this.wsConnection.on('open', this.onConnectionOpen);
    this.wsConnection.on('close', this.onConnectionClose);
    this.wsConnection.on('message', this.onMessage);
  }

  init = () => {
    NodeWebcam.list(( list ) => {
      this.devices = list;
    });
    this.connect();
  }
}

export { CamHandler };