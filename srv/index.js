import Koa from 'koa';
import auth from 'koa-basic-auth';
import mainRouter from './routes/main.js';
import sensorsRouter from './routes/sensors.js';
import config from './config.js';

const app = new Koa();

try {
  if (config.nodeEnv == 'prod' && (!config.username || !config.pwd)) {
    throw 'production config not set!!!';
  }
} catch (err) {
  throw err;
}

// Basic Auth
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.set('WWW-Authenticate', 'Basic');
      ctx.body = 'go away';
    } else {
      throw err;
    }
  }
});

// logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// require auth
app.use(auth({ name: config.username, pass: config.pwd}));

app
  .use(mainRouter.routes())
  .use(mainRouter.allowedMethods())
  .use(sensorsRouter.routes())
  .use(sensorsRouter.allowedMethods())
  .listen(config.serverPort);

console.log(`Home Guard listening on port ${config.serverPort}`);

export default app;