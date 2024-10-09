import NodeWebcam from 'node-webcam';
import WebSocket from 'ws';
import { 
  FastifyBaseLogger,
} from 'fastify';

import { ConfigType } from "./config.js";

type CamHandlerOptionsType = {
  config: ConfigType,
}

enum WS_MESSAGES {
  REGISTER_AUTH = 'REGISTER_AUTH',
  REGISTER_CONFIRM = 'REGISTER_CONFIRM',
  STREAM_PLAY = 'STREAM_PLAY',
  STREAM_STOP = 'STREAM_STOP',
  STREAM_DATA = 'STREAM_DATA'
}

enum STREAM_STATE {
  PLAY = 'PLAY',
  STOP = 'STOP'
}

const CamHandler = class {
  wsConnection: WebSocket | null;
  clientId: string;
  deviceId: string | null;
  devices: string[];
  registerUrl;
  logger: FastifyBaseLogger | null;
  config: ConfigType;
  framesReader: ReturnType<typeof setInterval> | null;
  streamState: STREAM_STATE;
  
  constructor(options: CamHandlerOptionsType) {
    this.wsConnection = null;
    this.logger = null;
    this.devices = [];
    this.framesReader = null;
    this.config = options.config;
    this.clientId = this.config.clientId;
    this.deviceId = this.config.defaultDeviceId;
    this.registerUrl = `${this.config.connectionSecure ? 'wss' : 'ws'}://${this.config.serverHost}/api/monitoring/register-cam/${this.clientId}`;
    this.streamState = STREAM_STATE.STOP;
  }

  setLogger = (logger: FastifyBaseLogger) => {
    this.logger = logger;
  }

  getCamDevices = () => {
    return this.devices;
  }

  selectCamDevice = (deviceId: string) => {
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
      device: this.deviceId ? `${this.deviceId}` : false,
      callbackReturn: "base64",
      verbose: false
    });

    Webcam.capture(`/tmp/frame-${this.clientId}`, ( err, data ) => {
      if (err) {
        return this.logger?.error(err);
      }
      this.wsConnection?.send(JSON.stringify({
        action: WS_MESSAGES.STREAM_DATA,
        staticToken: this.config.authStaticToken,
        data
      }));
    });
  }

  onConnectionOpen = () => {
    this.logger?.info(`Connection established`);
  }

  onConnectionClose = () => {
    this.logger?.info(`Connection terminated, trying to reconnect in 10 secs...`);
    setTimeout(this.connect, 10000);
  }

  onMessage = async (event: string) => {
    const parsedEvent = JSON.parse(event);
    this.logger?.info(`Cam client ${this.clientId} receivied event: ${parsedEvent.action}`);
    if (parsedEvent.action === WS_MESSAGES.REGISTER_AUTH) {
      this.wsConnection?.send(JSON.stringify({
        action: WS_MESSAGES.REGISTER_AUTH,
        staticToken: this.config.authStaticToken
      }));
    }
    if (parsedEvent.action === WS_MESSAGES.STREAM_PLAY) {
      this.streamState = STREAM_STATE.PLAY;
      this.framesReader = setInterval(() => {
        if (this.streamState === STREAM_STATE.PLAY) {
          this.getCamFrame();
        }
      }, this.config.streamSendInterval);
    }
    if (parsedEvent.action === WS_MESSAGES.STREAM_STOP) {
      this.streamState = STREAM_STATE.STOP;
      if (this.framesReader) {
        clearInterval(this.framesReader);
      }
    }
  }

  onError = (error: WebSocket.ErrorEvent) => {
    this.logger?.error(error);
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

type CamHandlerType = InstanceType<typeof CamHandler>

export { CamHandler, CamHandlerType };