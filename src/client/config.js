import dotenv from 'dotenv';

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV,
  connectionSecure: false,
  serverDomain: process.env.SRV_DOMAIN || 'localhost',
  serverHost: process.env.SRV_HOST || 'localhost:3000',
  serverPort: process.env.SRV_PORT || 3000,
  clientHost: process.env.CLIENT_HOST || 'localhost:3001',
  clientPort: process.env.CLIENT_PORT || 3001,
  clientId: process.env.CLIENT_ID || 'cam01',
  streamSendInterval: 500,
  defaultDeviceId:  process.env.CLIENT_DEFAULT_DEVICE || 0,
  authStaticToken: process.env.AUTH_STATIC_TOKEN,
};

export { config };