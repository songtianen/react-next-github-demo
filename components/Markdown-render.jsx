import MarkdownIt from 'markdown-it';
import { memo, useMemo } from 'react';
import 'github-markdown-css';

const md = new MarkdownIt({ html: true, linkify: true });

// atob 转换中文
function base64_to_utf8(string) {
  return decodeURIComponent(escape(atob(string)));
}

export default memo(function markdownRender({ content, isBase64 }) {
  const markdown = isBase64 ? base64_to_utf8(content) : content;
  const html = useMemo(() => md.render(markdown), [markdown]);
  return (
    <div className='markdown-body'>
      <div dangerouslySetInnerHTML={{ __html: html }}></div>
    </div>
  );
});
