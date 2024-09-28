import dotenv from 'dotenv';

dotenv.config();

type ConfigType = {
  nodeEnv: string | undefined,
  connectionSecure: string | boolean,
  serverDomain: string,
  serverHost: string,
  serverPort: number,
  clientHost: string,
  clientPort: number,
  clientId: string,
  streamSendInterval: number,
  defaultDeviceId: string | null,
  authStaticToken: string | undefined,
}

const config: ConfigType = {
  nodeEnv: process.env.NODE_ENV,
  connectionSecure: process.env.CONNECTION_SECURE || false,
  serverDomain: process.env.SRV_DOMAIN || 'localhost',
  serverHost: process.env.SRV_HOST || 'localhost:3000',
  serverPort: Number(process.env.SRV_PORT) || 3000,
  clientHost: process.env.CLIENT_HOST || 'localhost:3001',
  clientPort: Number(process.env.CLIENT_PORT) || 3001,
  clientId: process.env.CLIENT_ID || 'cam01',
  streamSendInterval: 500,
  defaultDeviceId: process.env.CLIENT_DEFAULT_DEVICE || null,
  authStaticToken: process.env.AUTH_STATIC_TOKEN,
};

export { config, ConfigType };