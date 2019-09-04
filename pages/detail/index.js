import dynamic from 'next/dynamic';
import WithRepoBasic from '../../components/with-repo-basic';
import api from '../../lib/api';

const MarkDownRender = dynamic(
  () => import('../../components/Markdown-render'),
  {
    loading: () => <p>加载中</p>,
  },
);

function Detail({ readme }) {
  return <MarkDownRender content={readme.content} isBase64={true} />;
}
Detail.getInitialProps = async ({ ctx }) => {
  const reademeResp = await api.request(
    {
      url: `repos/${ctx.query.owner}/${ctx.query.name}/readme`,
    },
    ctx.req,
    ctx.res,
  );
  return {
    readme: reademeResp.data,
  };
};
export default WithRepoBasic(Detail, 'Index');
