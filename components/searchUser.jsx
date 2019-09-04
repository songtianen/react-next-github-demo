import { useState, useCallback, useRef } from 'react';
import api from '../lib/api';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce'; // 延时请求

const Option = Select.Option;

function SearchUser({ onChange, value }) {
  const lastFetchIdRef = useRef(0);
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);

  const fetchUser = useCallback(
    debounce((value) => {
      console.log('fetchUser.>', value);
      lastFetchIdRef.current += 1;
      const fetchId = lastFetchIdRef.current;
      setFetching(true);
      setOptions([]);
      api
        .request({
          url: `search/users?q=${value}`,
        })
        .then((resp) => {
          console.log('user:=>', resp);
          if (fetchId !== lastFetchIdRef.current) {
            /**
             * 通过利用react 的特性，
             * 设置lastFetchIdRef.current的值来
             * 对比用户是否多次请求，如果用户 输入了内容已经发送请求了，
             * 后来又修该了，应该获取 修改后的正确返回
             *  */
            return;
          }
          const data = resp.data.items.map((user) => {
            return {
              text: user.login,
              value: user.login,
            };
          });
          setFetching(false);
          setOptions(data);
        });
    }, 500),
    [],
  );
  // 用户选option选项之后
  const handleChange = (value) => {
    setOptions([]);
    setFetching(false);
    onChange(value);
  };
  return (
    <Select
      style={{ width: 200 }}
      showSearch={true}
      notFoundContent={fetching ? <Spin size='small' /> : <span>null</span>}
      filterOption={false}
      value={value}
      placeholder='创建者'
      onChange={handleChange}
      allowClear={true}
      onSearch={fetchUser}
    >
      {options.map((op) => {
        <Option key={op.value} value={op.value}>
          {op.text}
        </Option>;
      })}
    </Select>
  );
}

export default SearchUser;
