import Router from '@koa/router';

const router = new Router();

// Main route
router
  .get('/', async (ctx, next) => {
    ctx.body = 'Nothing to see here. Move along.';
  });

export default router;