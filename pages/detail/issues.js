import { useState, useCallback } from 'react';
import { getLastUpdated } from '../../lib/util';
import WithRepoBasic from '../../components/with-repo-basic';
import api from '../../lib/api';
import { Avatar, Button, Select, Spin } from 'antd';
import dynamic from 'next/dynamic';
import SearchUser from '../../components/searchUser';

const MdRender = dynamic(() => import('../../components/Markdown-render'));
const Option = Select.Option;

function IssueDatail({ issue }) {
  return (
    <div className='root'>
      <MdRender content={issue.body} />
      <div className='actions'>
        <Button href={issue.html_url} target='_blank'>
          打开issue讨论页面
        </Button>
      </div>
      <style jsx>
        {`
          .root {
            background: #fefefe;
            padding: 20px;
          }
          .actions {
            text-align: right;
          }
        `}
      </style>
    </div>
  );
}

function IssuesItem({ issue }) {
  const [showDatail, setShowDatail] = useState(false);
  const toggleShowDetail = useCallback(() => {
    // useCallback:避免闭包陷阱
    setShowDatail((detail) => !detail);
  }, []);

  return (
    <div>
      <div className='issue'>
        <Button
          type='primary'
          size='small'
          style={{
            position: 'absolute',
            right: 10,
            top: 10,
          }}
          onClick={toggleShowDetail}
        >
          {showDatail ? '隐藏' : '查看'}
        </Button>
        <div className='avatar'>
          <Avatar src={issue.user.avatar_url} shape='square' size={50} />
        </div>
        <div className='main-info'>
          <h6>
            <span>{issue.title}</span>
          </h6>
          <p className='sub-info'>
            <span>Update at{getLastUpdated(issue.updated_at)}</span>
          </p>
        </div>
        <style jsx>
          {`
            .issue {
              display: flex;
              position: relative;
              padding: 10px;
            }
            .issue:hover {
              background: #fafafa;
            }
            .issue + .issue {
              border-top: 1px solid #eee;
            }
            .main-info > h6 {
              max-width: 600px;
              font-size: 16px;
              padding-right: 60px;
            }
            .avatar {
              margin-right: 20px;
            }
            .sub-info {
              margin-bottom: 0;
            }
            .sub-info > span + span {
              display: inline-block;
              margin-left: 20px;
            }
          `}
        </style>
      </div>
      {showDatail ? <IssueDatail issue={issue} /> : null}
    </div>
  );
}

function makeQuery(creator, state, labels) {
  let createStr = creator ? `creator=${creator}` : '';
  let stateStr = state ? `state=${state}` : '';
  let labelStr = '';
  if (labels && labels.length > 0) {
    labelStr = `labels=${label.join(',')}`;
  }
  const arr = [];
  if (createStr) arr.push(createStr);
  if (stateStr) arr.push(stateStr);
  if (labelStr) arr.push(labelStr);
  return `?${arr.join('&')}`;
}

function Issues({ initialIssues, labes, owner, name }) {
  console.log('issues,labels', initialIssues, labes);
  const [creator, setCreator] = useState();
  const [state, setState] = useState();
  const [label, setLabel] = useState([]);
  const [issues, setIssues] = useState(initialIssues);
  const [fetching, setfetching] = useState(false);
  const handlecreatorChange = useCallback((value) => {
    setCreator(value);
  }, []);
  const handleStateChange = useCallback((value) => {
    setCreator(value);
  }, []);
  const handleLabelChange = useCallback((value) => {
    setCreator(value);
  }, []);
  const handleSearch = useCallback(() => {
    setfetching(true);
    api
      .request({
        url: `repos/${owner}/${name}/issues${makeQuery(creator, state, label)}`,
      })
      .then((resp) => {
        setIssues(resp.data);
        setfetching(false);
      })
      .catch((err) => {
        console.log(err);
        setfetching(false);
      });
  }, [owner, name, creator, state, label]);
  return (
    <div className='root'>
      <div className='search'>
        <SearchUser onChange={handlecreatorChange} value={creator} />
        <Select
          style={{
            width: 200,
            marginLeft: 20,
          }}
          placeholder='状态'
          onChange={handlecreatorChange}
          value={state}
        >
          <Option value='all'>ALL</Option>
          <Option value='open'>open</Option>
          <Option value='closed'>closed</Option>
        </Select>
        <Select
          mode='mutiple'
          style={{
            width: 200,
            flexGrow: 1,
            marginLeft: 20,
            marginRight: 20,
          }}
          placeholder='label'
          onChange={handleLabelChange}
          value={label}
        >
          {labes.map((la) => {
            <Option value={la.name} key={la.id}>
              {la.name}
            </Option>;
          })}
        </Select>
        <Button type='primary' disabled={fetching} onClick={handleSearch}>
          搜索
        </Button>
      </div>
      {fetching ? (
        <div className='loading'>
          <Spin></Spin>
        </div>
      ) : (
        <div className='issues'>
          {issues.map((issue) => (
            <IssuesItem issue={issue} key={issue.id}></IssuesItem>
          ))}
        </div>
      )}

      <style jsx>
        {`
          .issues {
            border: 1px solid #eee;
            border-radius: 5px;
            margin-bottom: 20px;
            margin-top: 20px;
          }
          .search {
            display: flex;
          }
          .loading {
            height: 400px;
            display: flex;
            align-items: center;
          }
        `}
      </style>
    </div>
  );
}
Issues.getInitialProps = async ({ ctx }) => {
  const { owner, name } = ctx.query;
  const fetchs = await Promise.all([
    await api.request(
      {
        url: `repos/${owner}/${name}/issues`,
      },
      ctx.req,
      ctx.res,
    ),
    await api.request(
      {
        url: `repos/${owner}/${name}/labels`,
      },
      ctx.req,
      ctx.res,
    ),
  ]);
  return {
    owner,
    name,
    initialIssues: fetchs[0].data,
    labes: fetchs[1].data,
  };
};
export default WithRepoBasic(Issues, 'Issues');
