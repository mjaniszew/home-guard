import dotenv from 'dotenv';

dotenv.config();

type ConfigType = {
  nodeEnv: string | undefined,
  connectionSecure: string | boolean,
  dbConnectionUrl: string,
  dbName: string,
  serverDomain: string,
  serverHost: string,
  serverPort: number,
  serverCorsOrigin: string,
  streamReceiveInterval: number,
  clientsInterval: number,
  authSecret: string
}

const config: ConfigType = {
  nodeEnv: process.env.NODE_ENV,
  connectionSecure: process.env.CONNECTION_SECURE || false,
  dbConnectionUrl: process.env.DB_CONNECTION_URL || 'mongodb://localhost:27017',
  dbName: process.env.DB_NAME || 'homeguard',
  serverDomain: process.env.SRV_DOMAIN || 'localhost',
  serverHost: process.env.SRV_HOST || 'localhost:3000',
  serverPort: Number(process.env.SRV_PORT || 3000),
  serverCorsOrigin: process.env.SRV_CORS_ORIGIN || 'http://localhost:5173',
  streamReceiveInterval: 200,
  clientsInterval: 10000,
  authSecret: process.env.AUTH_SECRET || 'defaultSecret'
};

export { config, ConfigType };