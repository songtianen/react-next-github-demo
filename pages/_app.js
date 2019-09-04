// 覆盖 next 默认组件样式
import App, { Container } from 'next/app';
import Layout from '../components/Layout';
import 'antd/dist/antd.css';
// react Hooks context 的使用
import { Provider } from 'react-redux';
import TextHoc from '../lib/whith-redux';
import PageLoading from '../components/PageLoading';
import Router from 'next/router';
import axios from 'axios';

/**
 * 自定义app
 * 1 笃定Layout
 * 2 保持一些公用的状态
 * 3 给页面传入一些自定义数据
 * 4 自定义错误处理
 */

class MyApp extends App {
  state = {
    context: 'value',
    loading: false,
  };

  startLoading = () => {
    this.setState({
      loading: true,
    });
  };
  stopLoading = () => {
    this.setState({
      loading: false,
    });
  };
  // 进行全局性的数据获取(全局状态)
  static async getInitialProps(ctx) {
    // console.log('app init 每一次页面切换都会被调用');
    const { Component } = ctx;
    let pageProps;
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
      return {
        pageProps,
      };
    }
    return {};
  }
  componentDidMount() {
    Router.events.on('routeChangeStart', this.startLoading);
    Router.events.on('routeChangeComplete', this.stopLoading);
    Router.events.on('routeChangeError', this.stopLoading);
    // axios
    //   .get('/github/search/repositories?q=react')
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });
  }
  componentWillUnmount() {
    Router.events.off('routeChangeStart', this.startLoading);
    Router.events.off('routeChangeComplete', this.stopLoading);
    Router.events.off('routeChangeError', this.stopLoading);
  }
  render() {
    const { Component, pageProps, reduxStore } = this.props;

    return (
      <Container>
        <Provider store={reduxStore}>
          {this.state.loading ? <PageLoading /> : null}
          <Layout>
            {/* 所有组件中就可以使用context提供的value了 */}
            <Component {...pageProps} />
          </Layout>
        </Provider>
      </Container>
    );
  }
}

export default TextHoc(MyApp);
