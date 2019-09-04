const axios = require('axios');
const config = require('../config');
const { client_id, client_secret, request_token_url } = config.github;

module.exports = (server) => {
  server.use(async (ctx, next) => {
    if (ctx.path === '/auth') {
      const code = ctx.query.code;
      if (!code) {
        ctx.body = 'code noe exist';
        return;
      }
      const result = await axios({
        method: 'POST',
        url: request_token_url,
        data: {
          client_id,
          client_secret,
          code,
        },
        headers: {
          Accept: 'application/json',
        },
      });
      if (result.status === 200 && (result.data && !result.data.error)) {
        // 获取 token 成功之后
        ctx.session.githubAuth = result.data;
        const { access_token, token_type } = result.data;
        const userInfoRes = await axios({
          method: 'GET',
          url: 'https://api.github.com/user',
          // 请求信息时 带上token
          headers: {
            Authorization: `${token_type} ${access_token}`,
          },
        });
        // console.log('userInfoRes', userInfoRes.data);
        // 保存在session里面
        ctx.session.userInfo = userInfoRes.data;
        ctx.redirect((ctx.session && ctx.session.urlBeforeOauthor) || '/');
        ctx.session.urlBeforeOauthor = '';
      } else {
        ctx.body = `request token failed ${result.message}`;
      }
    } else {
      await next();
    }
  });
  server.use(async (ctx, next) => {
    const path = ctx.path;
    const method = ctx.method;
    if (path === '/logout' && method === 'POST') {
      ctx.session = null;
      ctx.body = `logout success`;
    } else {
      await next();
    }
  });
  server.use(async (ctx, next) => {
    const path = ctx.path;
    const method = ctx.method;
    if (path === '/prepare-auth' && method === 'GET') {
      const { url } = ctx.query;
      ctx.session.urlBeforeOauthor = url;
      ctx.redirect(config.OAUTHORURL);
    } else {
      await next();
    }
  });
};
