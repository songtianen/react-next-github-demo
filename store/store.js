import { createStore, combineReducers, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';

import { composeWithDevTools } from 'redux-devtools-extension';
import axios from 'axios';

// action Types
const LOGOUT = 'LOGOUT';

const userState = {};

/**
 * 不能写成state.count +=1 :这样做只改变的state的属性没改变state
 * 这样会产生很多问题，因为在react中会用state的数据来判断有没有变化
 * 对比新的和老得state是否相等，判断对象是否相等是根据内存地址（如果只修改）
 * 虽然更新了状态但是页面并没有渲染，
 * 必须return一个新的对象
 */

/**
 * reducer 是一个纯函数，不应该使用其他的一些变量
 * 副作用：如果在reducer依赖于外部的变量标记，外部的
 * 变量修改了，就会影响reducer返回的内容
 * 如果需要使用外部变量，应该写到state里面去的
 * 2，有任何数据更新的时候，应该返回一个新的对象
 * 3，通过combinereducer进行reducer的合并
 */

function userReducer(state = userState, action) {
  switch (action.type) {
    case LOGOUT:
      return {};
    default:
      return state;
  }
}

const allReducers = combineReducers({
  user: userReducer,
});

// action creator
export function logout() {
  return (dispatch) => {
    axios
      .post('/logout')
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: LOGOUT,
          });
        } else {
          console.log('logoutError--', res);
        }
      })
      .catch((err) => {
        console.error('logoutError--', err);
      });
  };
}

/**
 * 每次渲染的时候都去_app.js创建一个新的store，解决服务端渲染与
 * 客户端 store不一致的问题
 * export 出去一个方法，每次渲染都去创建store
 *  */
export default function initialLizeStore(state) {
  const store = createStore(
    allReducers,
    Object.assign(
      {},
      {
        user: userState,
      },
      state,
    ),
    composeWithDevTools(applyMiddleware(ReduxThunk)),
  );
  return store;
}
