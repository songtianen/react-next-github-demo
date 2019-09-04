import React from 'react';
import createStore from '../store/store';
const isServer = typeof window === 'undefined';
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';

/**
 *
 * @description 保存store 客户端 切换路由时不需要重新创建store，
 * 服务端则创建新的store
 */
function getOrCreateStore(initialState) {
  if (isServer) {
    return createStore(initialState);
  }
  if (!window[__NEXT_REDUX_STORE__]) {
    window.__NEXT_REDUX_STORE__ = createStore(initialState);
  }
  return window[__NEXT_REDUX_STORE__];
}

export default (Comp) => {
  class WithReduxApp extends React.Component {
    constructor(props) {
      super(props);
      /**
       * 为什么要再一次创建store呢？
       * 因为getInitialProps 返回的内容会序列化成字符串
       * 客户端再去在页面中去拿到 这个字符串转换成JavaScript对象
       * 生成一个store，服务端生成的state 返回到客户端，因为直接
       * 返回store很难序列化
       *
       *  */
      this.reduxStore = getOrCreateStore(props.initialReduxState);
    }
    render() {
      const { Component, pageProps, ...rest } = this.props;
      if (pageProps) {
        pageProps.test = '123';
      }
      return (
        <Comp
          Component={Component}
          pageProps={pageProps}
          {...rest}
          reduxStore={this.reduxStore}
        />
      );
    }
  }
  // 注意app的静态方法，需要传进来
  WithReduxApp.getInitialProps = async (ctx) => {
    let reduxStore;
    if (isServer) {
      const { req } = ctx.ctx;
      const session = req.session;
      if (session && session.userInfo) {
        // 初始化store，可以传入默认数据
        reduxStore = getOrCreateStore({
          user: session.userInfo,
        });
      } else {
        reduxStore = getOrCreateStore();
      }
    } else {
      reduxStore = getOrCreateStore();
    }

    ctx.reduxStore = reduxStore; // 测试store

    let appProps = {};
    if (typeof Comp.getInitialProps === 'function') {
      appProps = await Comp.getInitialProps(ctx);
    }
    /**
     * getInitialProps 服务端渲染会执行一次
     * 客户端页面跳转也会执行一次
     * 所以在这里创建store
     * 作为属性返回
     * return {
      ...appProps,
      initialReduxState: reduxStore.getState(),
    };
     */
    return {
      ...appProps,
      initialReduxState: reduxStore.getState(),
    };
  };
  return WithReduxApp;
};
