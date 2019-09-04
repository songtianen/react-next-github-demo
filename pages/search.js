import { memo, isValidElement, useEffect } from 'react';
import { withRouter } from 'next/router';
import { Row, Col, List, Pagination } from 'antd';
import Link from 'next/link';
import Repo from '../components/Repo';
import { cacheArray } from '../lib/repo-basic-cache';

const api = require('../lib/api');

// 搜素条件
const LANGUAGE = ['JavaScript', 'HTML', 'CSS', 'TypeScript', 'Java', 'Rust'];
const SORT_TYPES = [
  {
    name: 'Best Match',
  },
  {
    name: 'Most Starts',
    value: 'starts',
    order: 'desc',
  },
  {
    name: 'Fewest Starts',
    value: 'starts',
    order: 'asc',
  },
  {
    name: 'Most Forks',
    value: 'forks',
    order: 'desc',
  },
  {
    name: 'Fewest Forks',
    value: 'forks',
    order: 'asc',
  },
];

/**
 *
 * sort: 排序方式
 * lang: 仓库项目开发主语言
 * order: 排序的顺序
 * page: 分页的页面
 */

function noop() {}
const selectedItemstyle = {
  borderLeft: '2px solid #e36209',
  fontWeight: '100',
  color: '#333',
};
const per_page = 20;
const FilterLink = memo(({ name, query, lang, sort, order, page }) => {
  let queryString = `?query=${query}`;
  if (lang) queryString += `&lang=${lang}`;
  if (sort) queryString += `&sort=${sort}&order=${order || 'desc'}`;
  if (page) queryString += `&page=${page}`;
  queryString += `&per_page=${per_page}`;
  return (
    <Link href={`/search${queryString}`}>
      {isValidElement(name) ? name : <a>{name}</a>}
    </Link>
  );
});

const isServer = typeof window === 'undefined';

function Search({ router, repos }) {
  useEffect(() => {
    if (!isServer) {
      cacheArray(repos.items);
    }
  });
  console.log(repos);
  const { ...querys } = router.query;

  const { lang, sort, order, page } = router.query;

  return (
    <div className='root'>
      <Row gutter={20}>
        <Col span={6}>
          <List
            bordered={true}
            header={<span className='list-header'>语言</span>}
            style={{ marginBottom: 20 }}
            dataSource={LANGUAGE}
            renderItem={(item) => {
              const selected = lang === item;
              return (
                <List.Item style={selected ? selectedItemstyle : null}>
                  {selected ? (
                    <span>{item}</span>
                  ) : (
                    <FilterLink
                      {...querys}
                      name={item}
                      lang={item}
                    ></FilterLink>
                  )}
                </List.Item>
              );
            }}
          ></List>
          <List
            bordered={true}
            header={<span className='list-header'>排序</span>}
            dataSource={SORT_TYPES}
            renderItem={(item) => {
              let selected = false;
              if (item.name === 'Best Match' && !sort) {
                selected = true;
              } else if (item.value === sort && item.order === order) {
                selected = true;
              }
              return (
                <List.Item style={selected ? selectedItemstyle : null}>
                  {selected ? (
                    <span>{item.name}</span>
                  ) : (
                    <FilterLink
                      {...querys}
                      sort={item.value}
                      order={item.order}
                      name={item.name}
                    ></FilterLink>
                  )}
                </List.Item>
              );
            }}
          ></List>
        </Col>
        <Col span={18}>
          <h3 className='repo-title'>{repos.total_count}仓库</h3>
          {repos.items.map((repo) => {
            return <Repo key={repo.id} repo={repo}></Repo>;
          })}
          <div className='repo-pagination'>
            <Pagination
              pageSize={per_page}
              current={page * 1 || 1}
              total={1000}
              onChange={noop}
              itemRender={(page, type, ol) => {
                const p =
                  type === 'page'
                    ? page
                    : type === 'prve'
                    ? page - 1
                    : page + 1;
                const name = type === 'page' ? page : ol;
                return (
                  <FilterLink {...querys} page={p} name={name}></FilterLink>
                );
              }}
            ></Pagination>
          </div>
        </Col>
      </Row>
      <style jsx>
        {`
          .root {
            padding: 20px 0;
          }
          .list-header {
            font-weight: 800;
            font-size: 16px;
          }
          .repo-title {
            border-bottom: 1px solid #eee;
            font-size: 24px;
            ling-height: 50px;
          }
          .repo-pagination {
            padding: 20px;
            text-align: center;
          }
        `}
      </style>
    </div>
  );
}

Search.getInitialProps = async ({ ctx }) => {
  const { query, sort, lang, order, page } = ctx.query;
  if (!query) {
    return {
      repos: {
        total_count: 0,
      },
    };
  }
  let queryString = `?q=${query}`;
  if (lang) queryString += `+language:${lang}`;
  if (sort) queryString += `&sort=${sort}&order=${order || 'desc'}`;
  if (page) queryString += `&page=${page}`;
  queryString += `&per_page=${per_page}`;

  const result = await api.request(
    {
      url: `search/repositories${queryString}`,
    },
    ctx.req,
    ctx.res,
  );
  return {
    repos: result.data,
  };
};

export default withRouter(Search);
