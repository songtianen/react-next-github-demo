import Link from 'next/link';
import { getLastUpdated } from '../lib/util'; // 日期
import { Icon, Tabs } from 'antd';

function getLicens(license) {
  return license ? `${license.spdx_id} license` : '';
}
// 日期
// function getLastUpdated(time) {
//   return moment(time).fromNow();
// }

export default ({ repo }) => {
  return (
    <div className='root'>
      <div className='basic-info'>
        <h3 className='repo-title'>
          <Link href={`/detail?owner=${repo.owner.login}&name=${repo.name}`}>
            <a>{repo.full_name}</a>
          </Link>
        </h3>
        <p className='repo-desc'>{repo.description}</p>
        <p className='other-info'>
          <span className='license'>{getLicens(repo.license)}</span>
          <span className='last-uodated'>
            {getLastUpdated(repo.updated_at)}
          </span>
          <span className='open-issues'>
            {repo.open_issues_count} open issues
          </span>
        </p>
      </div>
      <div className='lang-start'>
        <span className='lang'>{repo.language}</span>
        <span className='stars'>
          {repo.stargazers_count}
          <Icon type='star' theme='filled'></Icon>
        </span>
      </div>
      <style jsx>{`
        .root {
          display: flex;
          justify-content: space-between;
        }
        .other-info > span {
          margin-right: 10px;
        }
        .root + .root {
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .repo-title {
          font-size: 20px;
        }
        .lang-star {
          display: flex;
        }
        .lang-star {
          width: 120px;
          text-align: right;
        }
        .repo-desc {
          width: 400px;
        }
      `}</style>
    </div>
  );
};
