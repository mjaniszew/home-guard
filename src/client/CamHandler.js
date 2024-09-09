import NodeWebcam from 'node-webcam';
import WebSocket from 'ws';

const CamHandler = class {
  wsConnection;
  clientId;
  deviceId;
  devices;
  registerUrl;
  logger;
  framesReader;
  
  constructor(options) {
    this.clientId = options.clientId;
    this.deviceId = options.deviceId;
    this.registerUrl = options.registerUrl;
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

  getCamFrame = () => {
    this.logger.info(`Getting frame for: ${this.deviceId}`);

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
        data
      }));
    });
  }

  onConnectionOpen = () => {
    this.logger.info(`Connection established`);
  }

  onConnectionClose = () => {
    this.logger.info(`Connection terminated`);
  }

  onMessage = (event) => {
    const parsedEvent = JSON.parse(event);
    this.logger.info(`Cam client ${this.clientId} receivied event: ${parsedEvent.action}`);
    if (parsedEvent.action === 'STREAM_PLAY') {
      this.framesReader = setInterval(() => {
        this.getCamFrame();
      }, 400);
    }
    if (parsedEvent.action === 'STREAM_STOP') {
      clearInterval(this.framesReader);
    }
  }

  onError = (error) => {
    this.logger.error(error);
  }

  init = () => {
    NodeWebcam.list(( list ) => {
      this.devices = list;
    });

    this.wsConnection = new WebSocket(this.registerUrl, {
      perMessageDeflate: false
    });

    this.wsConnection.on('error', this.onError);
    this.wsConnection.on('open', this.onConnectionOpen);
    this.wsConnection.on('close', this.onConnectionClose);
    this.wsConnection.on('message', this.onMessage);
  }
}

export { CamHandler };