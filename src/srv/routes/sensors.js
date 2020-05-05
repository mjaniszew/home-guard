import Router from '@koa/router';
import body from 'koa-bodyparser';
import data from '../data.js';

const router = new Router({
  prefix: '/sensors'
});

const processRequestData = (requestData) => {
  requestData.forEach((element) => {
    let sensorData = data.sensors[element.id];
    if (sensorData) {
      sensorData.water = element.data;
      sensorData.lastUpdate = Date.now();
    } else {
      data.sensors[element.id] = {
        water: element.data,
        healthy: 1,
        lastUpdate: Date.now()
      }
    }
  });
};

// Sensors handling
router
  .get('/', async (ctx, next) => {
    ctx.body = data.sensors;
  })
  .put('/', body(), (ctx, next) => {
    try {
      processRequestData(ctx.request.body);
      console.log(data.sensors);
      ctx.body = 'OK';
    } catch (err) {
      throw err;
    }
  });

export default router;