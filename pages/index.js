import getConfig from 'next/config';
import { Button, Icon, Tabs } from 'antd';
import { connect } from 'react-redux';
import Repo from '../components/Repo';
import Router, { withRouter } from 'next/router';
import { useEffect } from 'react';
import { cacheArray } from '../lib/repo-basic-cache';

const api = require('../lib/api');

const { publicRuntimeConfig } = getConfig();

// 服务端渲染不应该被缓存
const isServer = typeof window == 'undefined';

function handleTabchange(activeKey) {
  Router.push(`/?key=${activeKey}`);
}
// 缓存数据
// let catchUserRepos, catchUserStartdRepos;

function Index({ userRepos, userStartdRepos, user, router }) {
  useEffect(() => {
    // 缓存数据
    if (!isServer) {
      cacheArray(userRepos);
      cacheArray(userStartdRepos);
    }
  });

  const tabKey = router.query.key || '1';
  if (!user || !user.id) {
    return (
      <div className='root'>
        <p>未登陆</p>
        <Button type='primary' href={publicRuntimeConfig.OAUTHORURL}>
          点击登陆
        </Button>
        <style jsx>
          {`
            .root {
              height: 400px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
          `}
        </style>
      </div>
    );
  }
  return (
    <div className='root'>
      <div className='user-info'>
        <img src={user.avatar_url} alt='user_avatar' className='avatar'></img>
        <span className='login'>{user.login}</span>
        <span className='name'>{user.name}</span>
        <span className='bio'>{user.bio}</span>
        <p className='email'>
          <Icon type='mail' style={{ marginRight: 10 }}></Icon>
          <a href={`mailto:${user.email}`}>{user.email}</a>
        </p>
      </div>
      <div className='user-repos'>
        <div className='user-repos'>
          {/* {userRepos.map((repo) => {
            return <Repo repo={repo}></Repo>;
          })} */}
          <Tabs activeKey={tabKey} onChange={handleTabchange} animated={false}>
            <Tabs.TabPane tab='你的仓库' key='1'>
              {userRepos.map((repo, index) => {
                return <Repo key={repo.id} repo={repo}></Repo>;
              })}
            </Tabs.TabPane>
            <Tabs.TabPane tab='关注的仓库' key='2'>
              {userStartdRepos.map((repo, index) => {
                return <Repo key={repo.id} repo={repo}></Repo>;
              })}
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
      <style jsx>
        {`
          .root {
            display: flex;
            align-item: flex-start;
            padding: 20px 0;
          }
          .user-info {
            width: 200px;
            margin-right: 40px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
          }
          .login {
            font-weight: 800;
            font-size: 20px;
            margin-top: 20px;
          }
          .name {
            font-size: 16px;
            color: #777;
          }
          .bio {
            marigin-top: 20px;
            color: #333;
          }
          .avatar {
            width: 100%;
            border-radius: 5px;
          }
          .user-repos {
            flex-grow: 1;
          }
        `}
      </style>
    </div>
  );
}

/**
 * getInitialProp 会在客户端不同页面跳转时调用
 * 同时会在服务端渲染，（访问此页面的时候）也会调用getInitialProps
 */

Index.getInitialProps = async ({ ctx, reduxStore }) => {
  const user = reduxStore.getState().user;
  // 判断是否登陆
  if (!user || !user.id) {
    return {
      isLogin: false,
    };
  }
  // 判断是否有缓存
  // if (!isServer) {
  //   if (cache.get('userRepos') && cache.get('userStartdRepos')) {
  //     return {
  //       userRepos: cache.get('userRepos'),
  //       userStartdRepos: cache.get('userStartdRepos'),
  //     };
  //   }
  // }

  const userRepos = await api.request(
    {
      url: '/user/repos',
    },
    ctx.req,
    ctx.res,
  );
  const userStartdRepos = await api.request(
    {
      url: '/user/starred',
    },
    ctx.req,
    ctx.res,
  );

  return {
    isLogin: true,
    userRepos: userRepos.data,
    userStartdRepos: userStartdRepos.data,
  };
};
export default withRouter(
  connect(function mapStateToProps(state) {
    return {
      user: state.user,
    };
  })(Index),
);
