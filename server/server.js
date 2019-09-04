const Koa = require('koa');
const next = require('next'); // 作为中间件使用
const Router = require('koa-router');
const session = require('koa-session');
const Redis = require('ioredis');
const RedisSessionStore = require('./session-store');
const auth = require('./author');
const api = require('./api');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const atob = require('atob');

/**
 * @param dev 开发环境
 */

const dev = process.env.NODE_ENV !== 'production';
// 初始化next
const app = next({ dev });
// next处理http请求的响应
const handle = app.getRequestHandler();
// 创建一个redis client
const redis = new Redis();
// 设置nodejs全局增加一个atob方法
global.atob = atob;

// next编译完成之后才能才能取响应请求
app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(cors());
  server.keys = ['song']; //加密
  const SESSION_CONFIG = {
    key: 'jid',
    // maxAge: 10 * 1000, // 过期时间s
    store: new RedisSessionStore(redis),
  };
  server.use(koaBody());
  // 使用session中间件
  server.use(session(SESSION_CONFIG, server));
  // 配置处理github验证登陆
  auth(server);
  // 代理请求githubAPI
  api(server);
  // 路由
  router.get('/a/:id', async (ctx, next) => {
    const id = ctx.params.id;
    await handle(ctx.req, ctx.res, {
      pathname: '/a',
      query: {
        id: { id },
      },
    });
    /**
     * 为了绕过 Koa 的内置 response 处理，
     * 你可以显式设置 ctx.respond = false;
     *  */
    ctx.respond = false;
  });
  router.get('/api/user/info', async (ctx, next) => {
    const user = ctx.session.userInfo;
    if (!user) {
      ctx.status = 401;
      ctx.body = 'Need Login';
    } else {
      ctx.body = user;
      // 设置header
      ctx.set('Content-Type', 'application/json');
    }
  });

  server.use(router.routes()); // 使用router中间件
  server.use(async (ctx, next) => {
    ctx.res.statusCode = 200;
    await next();
  });
  server.use(async (ctx, next) => {
    // ctx.cookies.set('id', 'userid');
    ctx.req.session = ctx.session;
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
  });
  server.listen(3000, () => {
    console.log('server listening on 3000');
  });
});
