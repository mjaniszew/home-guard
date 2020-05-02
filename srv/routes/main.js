import Router from '@koa/router';

const router = new Router();

// Main route
router
  .get('/', (ctx, next) => {
    ctx.body = 'Nothing to see here. Move along.';
  });

export default router;