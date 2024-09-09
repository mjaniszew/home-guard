import dotenv from 'dotenv';

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV,
  serverHost: process.env.HOST || 'localhost',
  serverPort: process.env.SRV_PORT || 3000,
  clientHost: process.env.HOST || 'localhost',
  clientPort: process.env.CLIENT_PORT || 3001,
  clientId: process.env.CLIENT_ID || 'cam01',
  streamReceiveInterval: 200,
  streamSendInterval: 200,
  clientsInterval: 10000,
  defaultDeviceId:  process.env.CLIENT_DEFAULT_DEVICE || 0
};

export { config };