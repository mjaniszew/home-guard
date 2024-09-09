import dotenv from 'dotenv';

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV,
  serverHost: process.env.HOST || 'localhost',
  serverPort: process.env.SRV_PORT || 3000,
  streamReceiveInterval: 200,
  streamSendInterval: 200,
  clientsInterval: 10000,
  authSecret: process.env.AUTH_SECRET,
  authUser: process.env.AUTH_USER,
  authPwd: process.env.AUTH_PWD
};

export { config };