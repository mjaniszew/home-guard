import dotenv from 'dotenv';

dotenv.config();

const config = {
    nodeEnv: process.env.NODE_ENV,
    username: process.env.HG_USERNAME,
    pwd: process.env.HG_PWD,
    serverPort: process.env.HG_PORT || 3000
};

export default config;