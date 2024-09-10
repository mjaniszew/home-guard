import dotenv from 'dotenv';

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV,
  connectionSecure: false,
  serverDomain: process.env.SRV_DOMAIN || 'localhost',
  serverHost: process.env.SRV_HOST || 'localhost:3000',
  serverPort: process.env.SRV_PORT || 3000,
  streamReceiveInterval: 200,
  clientsInterval: 10000,
  authSecret: process.env.AUTH_SECRET,
  authStaticToken: process.env.AUTH_STATIC_TOKEN,
  authUser: process.env.AUTH_USER,
  authPwd: process.env.AUTH_PWD
};

export { config };