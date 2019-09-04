import Repo from './Repo';
import { withRouter } from 'next/router';
import Link from 'next/link';
import api from '../lib/api';

import { get, cache } from '../lib/repo-basic-cache';
import { useEffect } from 'react';

const isServer = typeof window === 'undefined';

export default function(Comp, type = 'Index') {
  function makeQuery(queryObj) {
    const query = Object.entries(queryObj)
      .reduce((result, entry) => {
        result.push(entry.join('='));
        return result;
      }, [])
      .join('&');
    return `?${query}`;
  }
  function WithDetail({ repoBasic, router, ...rest }) {
    const query = makeQuery(router.query);
    useEffect(() => {
      if (!isServer) {
        cache(repoBasic);
      }
    });
    return (
      <div className='root'>
        <div className='repo-basic'>
          <Repo repo={repoBasic}></Repo>
          <div className='tabs'>
            {type === 'Index' ? (
              <span className='tab'>ReadeMe</span>
            ) : (
              <Link href={`/detail/${query}`}>
                <a className='tab index'>ReadMe</a>
              </Link>
            )}
            {type === 'Issues' ? (
              <span className='tab'>Issues</span>
            ) : (
              <Link href={`/detail/issues${query}`}>
                <a className='tab issues'>Issues</a>
              </Link>
            )}
          </div>
        </div>
        <div>
          <Comp {...rest}></Comp>
        </div>
        <style jsx>{`
          .root {
            padding-top: 20px;
          }
          .repo-basic {
            padding: 20px;
            border: 1px solid #eee;
            margin-bottom: 20px;
            border-radios: 5px;
          }
          .tab + .tab {
            margin-left: 20px;
          }
        `}</style>
      </div>
    );
  }

  WithDetail.getInitialProps = async (context) => {
    const { router, ctx } = context;
    const { owner, name } = ctx.query;
    const full_name = `${owner}/${name}`;

    let pageData = {};
    if (Comp.getInitialProps) {
      pageData = await Comp.getInitialProps(context);
    }
    // 如果有缓存
    if (get(full_name)) {
      return {
        repoBasic: get(full_name),
        ...pageData,
      };
    }
    const repoBasic = await api.request(
      {
        url: `repos/${owner}/${name}`,
      },
      ctx.req,
      ctx.res,
    );

    return {
      repoBasic: repoBasic.data,
      ...pageData,
    };
  };

  return withRouter(WithDetail);
}
